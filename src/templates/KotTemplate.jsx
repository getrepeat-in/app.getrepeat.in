import React from 'react';
import { getImageUrl } from '@/lib/utils';

const KotTemplate = ({ order, restaurant }) => {
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
    <div style={styles.receipt} id="printable-kot">
      <div style={styles.center}>
        {restaurant?.logo && (
           <img src={getImageUrl(restaurant.logo, false, 'thumbnail')} alt="Logo" style={{ width: '40px', height: '40px', margin: '0 auto', objectFit: 'contain' }} />
        )}
        <h2 style={{ ...styles.bold, margin: '2px 0 5px 0', fontSize: '16px' }}>{restaurant?.name || 'Restaurant'}</h2>
      </div>

      <div style={styles.divider}></div>

      <div>
        <h3 style={{ ...styles.center, ...styles.bold, fontSize: '20px', margin: '5px 0' }}>
          TOKEN: {order?.tokenNumber || (order?.orderNumber ? order.orderNumber.slice(-4) : 'N/A')}
        </h3>
        <p style={{ margin: '2px 0' }}>Type: <span style={styles.bold}>{order?.orderType || 'DINE-IN'}</span></p>
        <div style={styles.flexBetween}>
          <span>Date: {order?.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span>ID: {order?.orderNumber ? order.orderNumber.split('-').pop() : order?._id?.slice(-6)}</span>
        </div>
        
        {order?.table && (
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
            TABLE: {order.table.tableNumber} {order.table.zone ? `(${order.table.zone})` : ''}
          </p>
        )}
      </div>

      <div style={styles.divider}></div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '20%' }}>Qty</th>
            <th style={styles.th}>Item</th>
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
                    <div style={{ fontSize: '12px', color: '#333', fontWeight: 'normal', textTransform: 'none' }}>- {item.variant.name}</div>
                  )}
                  {item.addons && item.addons.map((mod, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#333', fontWeight: 'normal', textTransform: 'none' }}>- {mod.name || mod}</div>
                  ))}
                  {item.specialInstructions && (
                    <div style={{ fontSize: '12px', marginTop: '2px', backgroundColor: '#000', color: '#fff', display: 'inline-block', padding: '2px 4px', borderRadius: '2px' }}>
                      NOTE: {item.specialInstructions}
                    </div>
                  )}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div style={styles.divider}></div>
      
      <div style={{ fontSize: '12px', textAlign: 'center' }}>
        <p>Server: {order?.serverName || 'System'}</p>
      </div>
    </div>
  );
};

export default KotTemplate;
