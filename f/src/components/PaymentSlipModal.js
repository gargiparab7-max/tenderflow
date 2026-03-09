import React, { useState, useRef } from 'react';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { FileText, Download, X, Printer } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentSlipModal = ({ orderId, orderTitle, onClose }) => {
    const [slip, setSlip] = useState(null);
    const [loading, setLoading] = useState(true);
    const slipRef = useRef(null);

    React.useEffect(() => {
        const fetchSlip = async () => {
            try {
                const res = await api.get(`/orders/${orderId}/slip`);
                setSlip(res.data);
            } catch (err) {
                toast.error('Failed to load payment slip');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchSlip();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const handleDownload = () => {
        if (!slip) return;
        const content = slipRef.current?.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Slip - ${slip.slip_no || slip.order_id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e; background: white; }
          .slip-wrapper { max-width: 680px; margin: auto; }
          ${getSlipStyles()}
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    const formatCurrency = (val) =>
        `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const paymentStatusBadge = (status) => {
        const colors = {
            paid: '#16a34a',
            pending: '#d97706',
            refunded: '#2563eb',
        };
        return `<span style="background:${colors[status] || '#6b7280'}20;color:${colors[status] || '#6b7280'};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;">${status || 'N/A'}</span>`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full" />
                    <p className="text-muted-foreground font-medium">Loading payment slip...</p>
                </div>
            </div>
        );
    }

    if (!slip) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 flex flex-col max-h-[90vh]">
                {/* Modal header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent" />
                        <h2 className="font-manrope font-bold text-lg">Payment Slip</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleDownload} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm" size="sm">
                            <Printer className="h-4 w-4 mr-1.5" />
                            Print / Download PDF
                        </Button>
                        <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Slip content */}
                <div className="overflow-y-auto p-6">
                    <div ref={slipRef}>
                        <SlipContent slip={slip} formatCurrency={formatCurrency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// The actual slip layout rendered both in modal and for printing
const SlipContent = ({ slip, formatCurrency }) => {
    const fmtDate = (iso) => iso ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : 'N/A';

    const payMethod = slip.payment_method === 'online' ? 'Online (Wallet)' : 'Bank Transfer (RTGS/NEFT)';
    const payStatus = slip.payment_status || 'pending';
    const payStatusColor = { paid: '#16a34a', pending: '#d97706', refunded: '#2563eb' }[payStatus] || '#6b7280';

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#1a1a2e' }}>
            {/* Company Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #6366f1', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px' }}>TenderFlow</div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{slip.company_name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{slip.company_address}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    GSTIN: <strong style={{ color: '#555' }}>{slip.company_gst_no}</strong>
                </div>
            </div>

            {/* Title row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>TAX INVOICE / PAYMENT SLIP</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Original Copy</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: '#555' }}>Slip No.</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#6366f1' }}>{slip.slip_no || slip.order_id?.slice(0, 12).toUpperCase()}</div>
                    {slip.po_number && <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '2px', fontWeight: 600 }}>PO No: {slip.po_number}</div>}
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Date: {fmtDate(slip.created_at)}</div>
                </div>
            </div>

            {/* Bill To & Delivery */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1, background: '#f8f8ff', border: '1px solid #e0e0f0', borderRadius: '8px', padding: '12px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>Bill To</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{slip.buyer_company ? slip.buyer_company : slip.user_name}</div>
                    {slip.buyer_company && <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>Attn: {slip.user_name}</div>}
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>{slip.user_email}</div>
                    {slip.buyer_gstin && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>GSTIN: <strong style={{ color: '#555' }}>{slip.buyer_gstin}</strong></div>}
                </div>

                {(slip.delivery_address || slip.delivery_city || slip.delivery_state || slip.delivery_pincode) && (
                    <div style={{ flex: 1, background: '#f8f8ff', border: '1px solid #e0e0f0', borderRadius: '8px', padding: '12px 16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>Ship To</div>
                        <div style={{ fontSize: '13px', color: '#333' }}>{slip.delivery_address}</div>
                        <div style={{ fontSize: '13px', color: '#333', marginTop: '2px' }}>
                            {slip.delivery_city} {slip.delivery_state ? `, ${slip.delivery_state}` : ''} {slip.delivery_pincode}
                        </div>
                    </div>
                )}
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: '#6366f1', color: 'white' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Description</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ background: '#fafafa' }}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{slip.tender_title}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{slip.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{formatCurrency(slip.unit_price)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee', fontWeight: 600 }}>{formatCurrency(slip.subtotal)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Tax Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <table style={{ width: '280px', fontSize: '13px' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '5px 8px', color: '#555' }}>Subtotal</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency((slip.subtotal || 0) + (slip.discount_amount || 0))}</td>
                        </tr>
                        {slip.discount_amount > 0 && (
                            <tr>
                                <td style={{ padding: '5px 8px', color: '#16a34a', fontWeight: 600 }}>Bulk Discount ({slip.bulk_discount_pct}%)</td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>-{formatCurrency(slip.discount_amount)}</td>
                            </tr>
                        )}
                        <tr>
                            <td style={{ padding: '5px 8px', color: '#555' }}>SGST @ {slip.sgst_rate}%</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right' }}>{formatCurrency(slip.sgst_amount)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '5px 8px', color: '#555' }}>CGST @ {slip.cgst_rate}%</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right' }}>{formatCurrency(slip.cgst_amount)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '5px 8px', color: '#555' }}>Total GST</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right' }}>{formatCurrency(slip.total_tax)}</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid #6366f1' }}>
                            <td style={{ padding: '8px 8px', fontWeight: 800, fontSize: '15px' }}>Grand Total</td>
                            <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: '#6366f1' }}>{formatCurrency(slip.total_price)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment Info */}
            <div style={{ background: '#f8f8ff', border: '1px solid #e0e0f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Method</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{payMethod}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Status</div>
                    <div style={{ display: 'inline-block', background: `${payStatusColor}20`, color: payStatusColor, padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                        {payStatus}
                    </div>
                </div>
            </div>

            {/* Notes */}
            {slip.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '12px', color: '#92400e' }}>
                    <strong>Notes:</strong> {slip.notes}
                </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <div style={{ fontWeight: 600, color: '#888' }}>Thank you for your business!</div>
                <div style={{ marginTop: '4px' }}>This is a computer-generated invoice. No signature required.</div>
                <div style={{ marginTop: '2px' }}>© {new Date().getFullYear()} {slip.company_name} | GSTIN: {slip.company_gst_no}</div>
            </div>
        </div>
    );
};

function getSlipStyles() {
    return `
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; }
  `;
}
