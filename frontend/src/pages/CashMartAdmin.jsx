import { useState, useEffect } from "react";
import {
  Gift,
  Coins,
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Truck,
  X,
  Sliders,
  Award,
  Users,
  Search,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { rewardsApi, studentsApi, filesApi } from "../services/api";

const GIFT_CATEGORIES = [
  "Chocolates & Treats",
  "Stationery",
  "Privileges & Passes",
  "Collectibles",
];

export default function CashMartAdmin() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory"); // inventory | orders | config | grant
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [config, setConfig] = useState({
    assignment_cash: 50,
    exam_cash: 100,
    high_score_cash: 50,
    streak_cash: 10,
    note_upload_cash: 25,
  });
  const [loading, setLoading] = useState(true);
  const [searchOrder, setSearchOrder] = useState("");

  // Add/Edit Gift Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: GIFT_CATEGORIES[0],
    cash_price: 150,
    stock: 50,
    image_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Manual Grant Cash Modal/State
  const [grantStudentId, setGrantStudentId] = useState("");
  const [grantAmount, setGrantAmount] = useState(50);
  const [grantDesc, setGrantDesc] = useState("Faculty Appreciation Award");
  const [grantSuccess, setGrantSuccess] = useState(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [itemList, orderList, cfg, stList] = await Promise.allSettled([
        rewardsApi.listItems(token),
        rewardsApi.getAllOrders(token),
        rewardsApi.getConfig(token),
        studentsApi.list(token),
      ]);

      if (itemList.status === "fulfilled" && Array.isArray(itemList.value)) {
        setItems(itemList.value);
      }
      if (orderList.status === "fulfilled" && Array.isArray(orderList.value)) {
        setOrders(orderList.value);
      }
      if (cfg.status === "fulfilled" && cfg.value) {
        setConfig(cfg.value);
      }
      if (stList.status === "fulfilled" && Array.isArray(stList.value)) {
        setStudents(stList.value);
      }
    } catch (err) {
      console.error("Failed loading CashMart admin", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      category: GIFT_CATEGORIES[0],
      cash_price: 150,
      stock: 50,
      image_url: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      cash_price: item.cash_price,
      stock: item.stock,
      image_url: item.image_url || "",
    });
    setIsModalOpen(true);
  };

  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;
    setUploadingImage(true);
    try {
      const res = await filesApi.upload(token, file, "rewards");
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
      }
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Gift title is required");

    try {
      if (editingItem) {
        await rewardsApi.updateItem(token, editingItem.id, formData);
      } else {
        await rewardsApi.createItem(token, formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Could not save item: " + err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this reward gift?")) return;
    try {
      await rewardsApi.deleteItem(token, id);
      loadData();
    } catch (err) {
      alert("Could not delete item: " + err.message);
    }
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await rewardsApi.updateOrderStatus(token, orderId, { status: newStatus });
      loadData();
    } catch (err) {
      alert("Could not update order status: " + err.message);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await rewardsApi.updateConfig(token, config);
      alert("✅ CASH reward rules updated successfully!");
    } catch (err) {
      alert("Could not update config: " + err.message);
    }
  };

  const handleManualGrant = async (e) => {
    e.preventDefault();
    if (!grantStudentId) return alert("Select a student to reward.");
    try {
      const res = await rewardsApi.adminGrant(token, {
        student_id: Number(grantStudentId),
        amount: Number(grantAmount),
        description: grantDesc,
      });
      setGrantSuccess(res);
      loadData();
    } catch (err) {
      alert("Grant failed: " + err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchOrder) return true;
    const q = searchOrder.toLowerCase();
    return (
      o.student_name?.toLowerCase().includes(q) ||
      o.item_title?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
            <Coins size={14} className="text-amber-600" /> CASH Economy & Gift Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            CASHMART Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize gifts, chocolates, stock levels, reward points rules, and fulfill student orders.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Add New Gift
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "inventory"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Gift size={15} /> Gifts Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Package size={15} /> Student Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "config"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sliders size={15} /> CASH Reward Rules
        </button>
        <button
          onClick={() => setActiveTab("grant")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "grant"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Award size={15} /> Manual Faculty Grant
        </button>
      </div>

      {/* TAB 1: INVENTORY */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Gift size={40} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {item.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow">
                    Stock: {item.stock}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-extrabold text-slate-800 text-base line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-2">
                <div className="text-amber-600 font-black text-base flex items-center gap-1">
                  <Coins size={15} /> {item.cash_price}{" "}
                  <span className="text-[10px] text-slate-400 font-bold">CASH</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Edit gift details"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Remove gift"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">Student Redemption Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review gifts claimed by students and mark them Dispatched or Delivered.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Gift</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Instructions</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {order.student_name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {order.item_title}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">
                      {order.cash_paid} CASH
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                      {order.delivery_notes || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.status === "Approved"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved / Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancel & Refund</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No matching student orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIG */}
      {activeTab === "config" && (
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">CASH Earning Parameters</h3>
            <p className="text-xs text-slate-500 mt-1">
              Set the exact CASH rewards given to students for completing academic work.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assignment Turn-in Reward (CASH):
              </label>
              <input
                type="number"
                value={config.assignment_cash}
                onChange={(e) =>
                  setConfig({ ...config, assignment_cash: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                Awarded immediately when a student submits homework.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Exam Completion Reward (CASH):
              </label>
              <input
                type="number"
                value={config.exam_cash}
                onChange={(e) =>
                  setConfig({ ...config, exam_cash: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                High Score Honor Bonus (90%+ marks) (CASH):
              </label>
              <input
                type="number"
                value={config.high_score_cash}
                onChange={(e) =>
                  setConfig({ ...config, high_score_cash: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Study Streak Reward (CASH):
              </label>
              <input
                type="number"
                value={config.streak_cash}
                onChange={(e) =>
                  setConfig({ ...config, streak_cash: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow hover:bg-slate-800 transition"
            >
              Save Reward Rules
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: MANUAL GRANT */}
      {activeTab === "grant" && (
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm max-w-xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Faculty Bonus CASH Grant</h3>
            <p className="text-xs text-slate-500 mt-1">
              Directly award CASH points to a student for exceptional participation, conduct, or project work.
            </p>
          </div>

          {grantSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              🎉 Successfully awarded {grantSuccess.amount_granted} CASH to{" "}
              {grantSuccess.student_name}! New Balance: {grantSuccess.new_balance} CASH.
            </div>
          )}

          <form onSubmit={handleManualGrant} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Student:
              </label>
              <select
                value={grantStudentId}
                onChange={(e) => setGrantStudentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Student --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.className || "Class"} - {st.batch || "Batch"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CASH Amount:
              </label>
              <input
                type="number"
                value={grantAmount}
                onChange={(e) => setGrantAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Note:
              </label>
              <input
                type="text"
                value={grantDesc}
                onChange={(e) => setGrantDesc(e.target.value)}
                placeholder="e.g. Science Fair 1st Prize, Perfect Attendance"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition"
            >
              Grant Points to Student
            </button>
          </form>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-[32px] p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-lg">
                {editingItem ? "Edit Reward Gift" : "Create New Reward Gift"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gift Title:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cadbury Dairy Milk Silk"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  {GIFT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CASH Price:
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.cash_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cash_price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Quantity:
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Appealing description of this gift..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL or Upload:</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... image link"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 cursor-pointer"
                />
                {uploadingImage && <p className="text-[10px] text-amber-600 mt-1">Uploading image...</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition"
                >
                  {editingItem ? "Save Changes" : "Create Gift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
