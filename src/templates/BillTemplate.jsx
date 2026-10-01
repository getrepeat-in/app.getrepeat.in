import React from 'react';
import { getImageUrl } from '@/lib/utils';

const BillTemplate = ({ order, restaurant }) => {
  const styles = {
    receipt: {
      width: '80mm',
      padding: '10px',
      margin: '0 auto',
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#000',
      backgroundColor: '#fff',
    },
    center: { textAlign: 'center' },
    bold: { fontWeight: 'bold' },
    divider: { borderBottom: '1px dashed #000', margin: '10px 0' },
    flexBetween: { display: 'flex', justifyContent: 'space-between' },
    table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse' },
    th: { paddingBottom: '5px', borderBottom: '1px dashed #000' },
    td: { padding: '5px 0' }
  };

  return (
    <div style={styles.receipt} id="printable-bill">
      <div style={styles.center}>
        {restaurant?.logo && (
           <img src={getImageUrl(restaurant.logo, false, 'thumbnail')} alt="Logo" style={{ width: '50px', height: '50px', margin: '0 auto', objectFit: 'contain' }} />
        )}
        <h2 style={{ ...styles.bold, margin: '5px 0' }}>{restaurant?.name || 'Restaurant Name'}</h2>
        <p style={{ margin: '2px 0' }}>
          {typeof restaurant?.address === 'object' 
            ? `${restaurant.address.street || ''}, ${restaurant.address.city || ''}`.replace(/^, |,$|,\s*$/g, '') 
            : (restaurant?.address || 'Restaurant Address')}
        </p>
        <p style={{ margin: '2px 0' }}>Ph: {restaurant?.phone || 'Phone Number'}</p>
        {restaurant?.gstin && <p style={{ margin: '2px 0' }}>GSTIN: {restaurant.gstin}</p>}
      </div>

      <div style={styles.divider}></div>

      <div>
        <h3 style={{ ...styles.center, ...styles.bold, fontSize: '16px', margin: '5px 0' }}>
          TOKEN: {order?.tokenNumber || (order?.orderNumber ? order.orderNumber.slice(-4) : 'N/A')}
        </h3>
        <p style={{ margin: '2px 0' }}>Order ID: {order?.orderNumber || order?._id || 'N/A'}</p>
        <p style={{ margin: '2px 0' }}>Date: {order?.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
        <p style={{ margin: '2px 0' }}>Type: <span style={styles.bold}>{order?.orderType || 'DINE-IN'}</span></p>
        
        {order?.customer && (
          <div style={{ marginTop: '5px' }}>
            <p style={{ margin: '2px 0' }}>Customer: {order.customer.name || 'Guest'}</p>
            {order.customer.phone && <p style={{ margin: '2px 0' }}>Ph: {order.customer.phone}</p>}
            {order.orderType === 'DELIVERY' && order.deliveryAddress && (
              <p style={{ margin: '2px 0' }}>Address: {order.deliveryAddress.street || ''}, {order.deliveryAddress.city || ''}</p>
            )}
          </div>
        )}
      </div>

      <div style={styles.divider}></div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Item</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order?.items?.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td style={{ ...styles.td, verticalAlign: 'top' }}>{item.quantity}</td>
                <td style={styles.td}>
                  {item.name}
                  {item.variant?.name && (
                    <div style={{ fontSize: '10px', color: '#555' }}>- {item.variant.name}</div>
                  )}
                  {item.addons && item.addons.map((mod, i) => (
                    <div key={i} style={{ fontSize: '10px', color: '#555' }}>- {mod.name || mod}</div>
                  ))}
                  {item.specialInstructions && (
                    <div style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>Note: {item.specialInstructions}</div>
                  )}
                </td>
                <td style={{ ...styles.td, textAlign: 'right', verticalAlign: 'top' }}>
                  ₹{(item.totalPrice || (item.price * item.quantity) || 0).toFixed(2)}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div style={styles.divider}></div>

      <div>
        <div style={styles.flexBetween}>
          <span>Subtotal</span>
          <span>₹{(order?.subtotal || 0).toFixed(2)}</span>
        </div>
        
        {order?.taxes?.map((tax, index) => (
          <div key={index} style={styles.flexBetween}>
            <span>{tax.name}</span>
            <span>₹{tax.amount?.toFixed(2)}</span>
          </div>
        ))}
        {(!order?.taxes || order.taxes.length === 0) && order?.totalAmount > order?.subtotal && (
           <div style={styles.flexBetween}>
             <span>Taxes & Fees</span>
             <span>₹{(order.totalAmount - order.subtotal).toFixed(2)}</span>
           </div>
        )}

        {order?.packagingCharge > 0 && (
          <div style={styles.flexBetween}>
            <span>Packaging</span>
            <span>₹{order.packagingCharge.toFixed(2)}</span>
          </div>
        )}
        {order?.discount > 0 && (
          <div style={styles.flexBetween}>
            <span>Discount</span>
            <span>- ₹{order.discount.toFixed(2)}</span>
          </div>
        )}
        <div style={styles.divider}></div>
        <div style={{ ...styles.flexBetween, ...styles.bold, fontSize: '14px' }}>
          <span>GRAND TOTAL</span>
          <span>₹{(order?.totalAmount || order?.total || 0).toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.divider}></div>
      
      {order?.paymentStatus === 'PENDING' && restaurant?.upiId && (
        <div style={{ ...styles.center, margin: '15px 0' }}>
          <p style={{ ...styles.bold, margin: '0 0 5px 0', fontSize: '14px' }}>Scan to Pay ₹{(order?.totalAmount || 0).toFixed(2)}</p>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${restaurant.upiId}&pn=${restaurant.name || 'Restaurant'}&am=${order.totalAmount || 0}&cu=INR`)}`} 
            alt="UPI QR Code" 
            style={{ width: '120px', height: '120px', margin: '0 auto', display: 'block' }} 
          />
          <p style={{ margin: '5px 0 0 0', fontSize: '10px' }}>UPI ID: {restaurant.upiId}</p>
        </div>
      )}

      <div style={{ ...styles.center, marginTop: '10px' }}>
        <p style={{ ...styles.bold, margin: '2px 0' }}>Thank You! Visit Again.</p>
        <p style={{ fontSize: '10px', margin: '5px 0' }}>Powered by GetRepeat.in</p>
      </div> 
    </div>
  );
};

export default BillTemplate;
