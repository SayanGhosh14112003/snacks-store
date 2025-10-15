import { useEffect, useState } from "react";
import useUserStore from "../store/userStore";
import { UserCog, MapPin, Shield, X } from "lucide-react";

export default function UserManagement() {
  const userList = useUserStore((state) => state.userList);
  const getAllUsers = useUserStore((state) => state.getAllUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");
  const changeRole=useUserStore((state)=>state.changeRole)
  useEffect(() => {
    getAllUsers();
  }, []);

  const handleShowAddress = (user) => {
    setSelectedUser(user);
    setShowAddressModal(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeModals = () => {
    setShowAddressModal(false);
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const tabs = [
    { key: "admin", label: "Admins", color: "from-orange-500 to-red-500" },
    { key: "customer", label: "Customers", color: "from-yellow-400 to-orange-500" },
    { key: "merchant", label: "Merchants", color: "from-red-500 to-orange-500" },
  ];

  const filteredUsers = userList?.filter((u) => u.role === activeTab);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-orange-50 to-yellow-50">
      <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8">
        User Management
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-full text-white font-semibold transition-all duration-300 ${
              activeTab === tab.key
                ? `bg-gradient-to-r ${tab.color} shadow-lg scale-105`
                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* User Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
        {filteredUsers?.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:scale-105 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-orange-600" /> {user.name}
                </h2>
                <span className="text-sm text-gray-500 capitalize">{user.role}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{user.email}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleShowAddress(user)}
                  className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg text-sm hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <MapPin size={14} /> Address
                </button>
                <button
                  onClick={() => handleChangeRole(user)}
                  className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  <Shield size={14} /> Role
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">No users found.</p>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && selectedUser && (
        <Modal title="User Address" onClose={closeModals}>
          {selectedUser.address ? (
            <div className="space-y-2 text-gray-700">
              <p><strong>Street:</strong> {selectedUser.address.street}</p>
              <p><strong>City:</strong> {selectedUser.address.city}</p>
              <p><strong>Pincode:</strong> {selectedUser.address.pincode}</p>
              <p><strong>Country:</strong> {selectedUser.address.country}</p>
            </div>
          ) : (
            <p className="text-gray-500">No address available.</p>
          )}
        </Modal>
      )}

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <Modal title="Change User Role" onClose={closeModals}>
          <p className="text-gray-700 mb-4">
            Change role for <strong>{selectedUser.name}</strong> ({selectedUser.email})
          </p>
          <div className="flex gap-2">
            {["admin", "merchant", "customer"].map((role) => (
              <button
                key={role}
                className={`px-4 py-2 rounded-lg text-white text-sm capitalize ${
                  role === selectedUser.role
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                }`}
                disabled={role === selectedUser.role}
                onClick={async() => {
                  // TODO: call your updateRole API here
                  await changeRole(selectedUser?._id,role)
                  console.log(`Change ${selectedUser.name} to ${role}`);
                  closeModals();
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ✨ Reusable Modal Component */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
