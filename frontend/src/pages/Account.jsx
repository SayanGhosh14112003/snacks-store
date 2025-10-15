import { useState } from "react";
import toast from "react-hot-toast";
import useUserStore from "../store/userStore";
import axios from "axios";

export default function Account() {
  const user = useUserStore((state) => state.user);
  const addAddress = useUserStore((state) => state.addAddress);
  const deleteAddress = useUserStore((state) => state.deleteAddress);
  const updateAddress = useUserStore((state) => state.updateAddress);

  const [newAddress, setNewAddress] = useState({ phone: "", location: "", pincode: "" });
  const [editAddress, setEditAddress] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ------------------------- ADD ADDRESS -------------------------
  const handleSubmit = async () => {
    const { phone, location, pincode } = newAddress;

    const phoneTrim = phone.trim();
    const locationTrim = location.trim();
    const pincodeTrim = pincode.trim();

    if (!/^\d{10}$/.test(phoneTrim)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (locationTrim.length < 5) {
      toast.error("Location must be at least 5 characters");
      return;
    }

    if (!/^\d{6}$/.test(pincodeTrim)) {
      toast.error("Pincode must be exactly 6 digits");
      return;
    }

    await addAddress({ phone: phoneTrim, location: locationTrim, pincode: pincodeTrim });
    setNewAddress({ phone: "", location: "", pincode: "" });
  };

  // ------------------------- DELETE ADDRESS -------------------------
  const handleDeleteConfirm = async () => {
    await deleteAddress(user?.addresses[deleteIndex]?._id);
    setIsDeleteModalOpen(false);
    setDeleteIndex(null);
  };

  // ------------------------- EDIT ADDRESS -------------------------
  const handleEditClick = (addr, idx) => {
    setEditAddress({ ...addr, idx });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editAddress) return;

    const { _id, phone, location, pincode } = editAddress;

    const phoneTrim = phone.trim();
    const locationTrim = location.trim();
    const pincodeTrim = pincode.trim();

    if (!/^\d{10}$/.test(phoneTrim)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (locationTrim.length < 5) {
      toast.error("Location must be at least 5 characters");
      return;
    }

    if (!/^\d{6}$/.test(pincodeTrim)) {
      toast.error("Pincode must be exactly 6 digits");
      return;
    }

    await updateAddress({ addressId: _id, phone: phoneTrim, location: locationTrim, pincode: pincodeTrim });
    setIsEditModalOpen(false);
    setEditAddress(null);
  };

  // ------------------------- USE CURRENT LOCATION -------------------------
  const useCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );

        setNewAddress((prev) => ({
          ...prev,
          location: res.data.display_name || "",
          pincode: res.data.address?.postcode || "",
        }));
      } catch (err) {
        toast.error("Failed to get current location");
        console.error(err);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Account</h1>

      {/* User Info */}
      <div className="space-y-1 text-gray-700">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      {/* Add New Address */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit();
        }}
        className="p-4 border rounded-lg shadow-sm bg-white space-y-2"
      >
        <h2 className="text-xl font-semibold">Add New Address</h2>

        <input
          type="text"
          placeholder="Phone"
          value={newAddress.phone}
          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
          className="w-full p-2 border rounded-md"
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Location"
            value={newAddress.location}
            onChange={(e) => setNewAddress({ ...newAddress, location: e.target.value })}
            className="flex-1 p-2 border rounded-md"
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-transform duration-300 hover:scale-105"
          >
            Use My Location
          </button>
        </div>

        <input
          type="text"
          placeholder="Pincode"
          value={newAddress.pincode}
          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
          className="w-full p-2 border rounded-md"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-transform duration-300 hover:scale-105"
        >
          Add Address
        </button>
      </form>

      {/* My Addresses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">My Addresses</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {user?.addresses?.map((addr, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg shadow-sm bg-white flex flex-col justify-between transform transition-transform duration-300 hover:scale-105"
            >
              <div className="space-y-1">
                <p><strong>Phone:</strong> {addr.phone}</p>
                <p><strong>Location:</strong> {addr.location}</p>
                <p><strong>Pincode:</strong> {addr.pincode}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditClick(addr, idx)}
                  className="flex-1 px-2 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-transform duration-300 hover:scale-105"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setDeleteIndex(idx); setIsDeleteModalOpen(true); }}
                  className="flex-1 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-transform duration-300 hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleEditSave();
            }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Edit Address</h2>

            <input
              type="text"
              value={editAddress.phone}
              onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="text"
              value={editAddress.location}
              onChange={(e) => setEditAddress({ ...editAddress, location: e.target.value })}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="text"
              value={editAddress.pincode}
              onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value })}
              className="w-full p-2 border rounded-md mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-transform duration-300 hover:scale-105"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleDeleteConfirm();
            }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
          >
            <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Delete</h2>
            <p>Are you sure you want to delete this address?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-transform duration-300 hover:scale-105"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
