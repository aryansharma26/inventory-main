import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Search, ShoppingCart, Trash2, Plus, Minus, Receipt,
  User, CreditCard, Banknote, Smartphone, Split, X,
  Printer, CheckCircle, Loader2, Package, Barcode
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts.js';
import { useActiveCustomers } from '../../hooks/useSuppliers.js';
import { useCreateSale } from '../../hooks/useSales.js';
import { formatCurrency, cn } from '../../utils/helpers.js';

function PosPage() {
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [splitPayments, setSplitPayments] = useState({ cash: 0, card: 0, upi: 0 });
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const barcodeRef = useRef(null);

  const { data: productsData } = useProducts({ search: searchQuery, status: 'active', limit: 50 });
  const { data: customers } = useActiveCustomers();
  const createSale = useCreateSale();

  const products = productsData?.docs || [];

  // Barcode scanning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Enter' && barcodeInput.length > 3) {
        const product = products.find(p => p.barcode === barcodeInput || p.sku === barcodeInput);
        if (product) addToCart(product);
        setBarcodeInput('');
      } else if (e.key.length === 1) {
        setBarcodeInput(prev => prev + e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [barcodeInput, products]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellingPrice } : item);
      }
      return [...prev, { ...product, quantity: 1, unitPrice: product.sellingPrice, tax: product.tax || 0, discount: product.discount || 0, total: product.sellingPrice }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id !== id) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty, total: newQty * item.unitPrice };
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item._id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.tax || 0) / 100), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discount || 0) / 100), 0);
  const total = subtotal + totalTax - totalDiscount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const items = cart.map(item => ({
      product: item._id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.tax,
      discount: item.discount,
    }));

    const paymentDetails = paymentMethod === 'split' ? splitPayments : {};

    createSale.mutate({
      customer: customer || undefined,
      items,
      paymentMethod,
      paymentDetails,
    }, {
      onSuccess: (response) => {
        setLastSale(response.data.data);
        setShowReceipt(true);
        clearCart();
      }
    });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode?.includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <div className="flex items-center gap-2">
          <Barcode className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Scan barcode or press keys</span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product._id}
                onClick={() => addToCart(product)}
                className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition-all text-left"
              >
                <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {product.image?.url ? (
                    <img src={product.image.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sku}</p>
                <p className="text-sm font-bold text-primary-600 mt-1">{formatCurrency(product.sellingPrice)}</p>
                <p className={cn('text-xs', product.quantity === 0 ? 'text-red-500' : product.quantity <= product.minStockAlert ? 'text-yellow-600' : 'text-green-600')}>
                  Stock: {product.quantity}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">Cart ({cart.length})</span>
            </div>
            <button onClick={clearCart} className="text-sm text-red-600 hover:underline">Clear</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products or scan barcode</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm font-medium w-16 text-right">{formatCurrency(item.total)}</p>
                  <button onClick={() => removeFromCart(item._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Customer */}
            <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
              <option value="">Walk-in Customer</option>
              {customers?.map(c => <option key={c._id} value={c._id}>{c.name} {c.phone && `(${c.phone})`}</option>)}
            </select>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(totalTax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-{formatCurrency(totalDiscount)}</span></div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'cash', icon: Banknote, label: 'Cash' },
                { key: 'card', icon: CreditCard, label: 'Card' },
                { key: 'upi', icon: Smartphone, label: 'UPI' },
                { key: 'split', icon: Split, label: 'Split' },
              ].map(method => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={cn('p-2 rounded-lg text-xs flex flex-col items-center gap-1 transition-colors',
                    paymentMethod === method.key ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  )}
                >
                  <method.icon className="w-4 h-4" />
                  {method.label}
                </button>
              ))}
            </div>

            {/* Split Payment Inputs */}
            {paymentMethod === 'split' && (
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs text-gray-500">Cash</label><input type="number" value={splitPayments.cash} onChange={e => setSplitPayments({ ...splitPayments, cash: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 rounded border dark:bg-gray-700 dark:border-gray-600 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Card</label><input type="number" value={splitPayments.card} onChange={e => setSplitPayments({ ...splitPayments, card: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 rounded border dark:bg-gray-700 dark:border-gray-600 text-sm" /></div>
                <div><label className="text-xs text-gray-500">UPI</label><input type="number" value={splitPayments.upi} onChange={e => setSplitPayments({ ...splitPayments, upi: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1 rounded border dark:bg-gray-700 dark:border-gray-600 text-sm" /></div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || createSale.isPending}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createSale.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Complete Sale
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">InventoryPro</h2>
              <p className="text-sm text-gray-500">{lastSale.invoiceNumber}</p>
              <p className="text-xs text-gray-400">{new Date(lastSale.createdAt).toLocaleString()}</p>
            </div>
            <div className="py-4 space-y-2">
              {lastSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(lastSale.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(lastSale.totalTax)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(lastSale.total)}</span></div>
              <div className="flex justify-between text-sm text-gray-500"><span>Payment</span><span className="capitalize">{lastSale.paymentMethod}</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowReceipt(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosPage;
