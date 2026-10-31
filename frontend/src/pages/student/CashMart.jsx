import { useState, useEffect } from "react";
import {
  Sparkles,
  Gift,
  ShoppingBag,
  Coins,
  Award,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  X,
  ChevronRight,
  Package,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { rewardsApi } from "../../services/api";

const CATEGORIES = [
  "All Gifts",
  "Chocolates & Treats",
  "Stationery",
  "Privileges & Passes",
  "Collectibles",
];

export default function StudentCashMart() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("catalog"); // catalog | my-orders
  const [selectedCategory, setSelectedCategory] = useState("All Gifts");
  const [items, setItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [balanceData, setBalanceData] = useState({
    cash_balance: 100,
    total_earned: 100,
    rank: "Silver Apprentice",
  });
  const [loading, setLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [bal, catalog, orders] = await Promise.allSettled([
        rewardsApi.getBalance(token),
        rewardsApi.listItems(token),
        rewardsApi.getMyOrders(token),
      ]);

      if (bal.status === "fulfilled" && bal.value) {
        setBalanceData(bal.value);
      }
      if (catalog.status === "fulfilled" && Array.isArray(catalog.value)) {
        setItems(catalog.value);
      }
      if (orders.status === "fulfilled" && Array.isArray(orders.value)) {
        setMyOrders(orders.value);
      }
    } catch (err) {
      console.error("Failed to load CashMart data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredItems = items.filter((item) => {
    if (selectedCategory === "All Gifts") return true;
    return item.category === selectedCategory;
  });

  const handleOpenPurchase = (item) => {
    setPurchasingItem(item);
    setDeliveryNote("Deliver at campus desk / hand-over");
    setOrderSuccess(null);
  };

  const handleConfirmPurchase = async () => {
    if (!purchasingItem || !token) return;
    setSubmittingOrder(true);
    try {
      const res = await rewardsApi.purchase(token, {
        item_id: purchasingItem.id,
        delivery_notes: deliveryNote,
      });

      setOrderSuccess(res);
      setPurchasingItem(null);
      // Refresh balance and orders
      loadData();
    } catch (err) {
      alert(err.message || "Could not complete redemption.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck size={12} /> Dispatched
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <X size={12} /> Cancelled (CASH Refunded)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock size={12} /> Pending Fulfillment
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
              <Gift size={14} className="text-amber-300" /> ACASH Rewards Bazaar
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              CASHMART
            </h1>
            <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
              Earn <strong>CASH</strong> by solving assignments, scoring in exams, and maintaining streaks. Spend your hard-earned points on chocolates, stationery, and digital perks!
            </p>
          </div>

          {/* Student Balance Pill */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-[28px] p-6 text-center min-w-[220px] shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 mx-auto shadow-md mb-2">
              <Coins size={24} className="animate-bounce" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
              Available Balance
            </span>
            <div className="text-3xl font-black text-white mt-0.5">
              {balanceData.cash_balance ?? 100}{" "}
              <span className="text-amber-300 text-lg font-bold">CASH</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white text-[11px] font-semibold">
              <Award size={13} className="text-amber-300" />
              {balanceData.rank || "Scholar"}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 flex items-center gap-3 mt-8 pt-6 border-t border-white/15">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === "catalog"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <ShoppingBag size={15} /> Rewards Catalog ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("my-orders")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === "my-orders"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Package size={15} /> My Redeemed Gifts ({myOrders.length})
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {orderSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">{orderSuccess.message}</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Remaining Balance: <strong>{orderSuccess.new_balance} CASH</strong>. Your order is registered with faculty.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* TAB 1: CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const canAfford = (balanceData.cash_balance ?? 100) >= item.cash_price;
              const isOutOfStock = item.stock <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div>
                    {/* Item Image */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Gift size={48} />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {item.category}
                      </span>
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-slate-800 text-base line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description || "Exciting student merchandise and real-world treat."}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Cost
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 font-black text-lg">
                        <Coins size={16} />
                        <span>{item.cash_price}</span>
                        <span className="text-[11px] font-bold text-slate-400">CASH</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPurchase(item)}
                      disabled={!canAfford || isOutOfStock}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                        !canAfford
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : isOutOfStock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm active:scale-95"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : !canAfford ? "Need More CASH" : "Redeem Gift"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-[32px] border border-slate-100 p-8">
              <Gift size={40} className="mx-auto text-slate-300 mb-2" />
              <h3 className="font-extrabold text-slate-700 text-base">No gifts in this category</h3>
              <p className="text-xs text-slate-400 mt-1">Check back soon as faculty adds new treats!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === "my-orders" && (
        <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">My Reward Deliveries</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track gifts you redeemed using CASH. Collect them directly at campus desk!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {myOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {order.item_image ? (
                      <img
                        src={order.item_image}
                        alt={order.item_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Gift size={24} className="text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{order.item_title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-amber-600 flex items-center gap-1">
                        <Coins size={13} /> {order.cash_paid} CASH
                      </span>
                      <span>•</span>
                      <span>
                        Ordered on {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "Recently"}
                      </span>
                    </div>
                    {order.delivery_notes && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Notes: {order.delivery_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>
            ))}

            {myOrders.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                You haven't redeemed any rewards yet. Solve tests to earn CASH and grab your first chocolate!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redemption Confirmation Modal */}
      {purchasingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Gift size={20} className="text-amber-500" /> Redeem Reward
              </h3>
              <button
                onClick={() => setPurchasingItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0">
                  {purchasingItem.image_url ? (
                    <img
                      src={purchasingItem.image_url}
                      alt={purchasingItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500">
                      <Gift size={28} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{purchasingItem.title}</h4>
                  <div className="text-amber-600 font-black text-sm flex items-center gap-1 mt-1">
                    <Coins size={14} /> {purchasingItem.cash_price} CASH
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery / Hand-over Instructions:
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Please deliver to Class 10A desk, or collect at staff room"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span className="font-bold">{balanceData.cash_balance} CASH</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Gift Cost:</span>
                  <span className="font-bold">- {purchasingItem.cash_price} CASH</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
                  <span>Remaining Balance:</span>
                  <span>{balanceData.cash_balance - purchasingItem.cash_price} CASH</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPurchasingItem(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={submittingOrder}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submittingOrder ? "Confirming..." : "Confirm & Redeem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
