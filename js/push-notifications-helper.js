// push-notifications.js - Add this to your Shopline/js/push-notifications.js
// Call these functions when order events happen

import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. When NEW ORDER placed - call this in cart.html after order success
export async function notifyNewOrder(db, orderData, orderId) {
  try {
    // Save to admin_notifications collection - admin page listens to this
    await addDoc(collection(db, "admin_notifications"), {
      type: "new_order",
      title: "🔔 New Order Received!",
      body: `Order #${orderId.substring(0,6)} - ₹${orderData.finalTotal} - ${orderData.customer.name} - ${orderData.customer.phone}`,
      orderId: orderId,
      customer: orderData.customer.name,
      phone: orderData.customer.phone,
      total: orderData.finalTotal,
      items: orderData.items.map(i=>i.name).join(', '),
      createdAt: serverTimestamp(),
      read: false,
      delivery: "Delivery all over Kerala"
    });

    // Also trigger browser notification if admin page open - via Firestore listener
    console.log('✅ Admin notified for new order:', orderId);

    // If you setup FCM Cloud Function, it will auto send push from this collection
    // Cloud Function code below will watch admin_notifications and send FCM

  } catch(e) {
    console.error('Notify error:', e);
  }
}

// 2. When ORDER CANCELLED - call this in order.html confirmCancel
export async function notifyCancelOrder(db, orderId, reason) {
  try {
    await addDoc(collection(db, "admin_notifications"), {
      type: "cancel_order",
      title: "❌ Order Cancelled",
      body: `Order #${orderId.substring(0,6)} cancelled - Reason: ${reason}`,
      orderId: orderId,
      reason: reason,
      createdAt: serverTimestamp(),
      read: false
    });
    console.log('✅ Admin notified for cancel:', orderId);
  } catch(e) {
    console.error('Notify cancel error:', e);
  }
}

// 3. When RETURN/EXCHANGE initiated
export async function notifyReturnOrder(db, orderId, type) {
  await addDoc(collection(db, "admin_notifications"), {
    type: type, // return or exchange
    title: type === 'return' ? '↩️ Return Initiated' : '🔄 Exchange Initiated',
    body: `Order #${orderId.substring(0,6)} - ${type} requested by customer`,
    orderId: orderId,
    createdAt: serverTimestamp(),
    read: false
  });
}

// 4. When Order Shipped/Delivered - for customer push (if you enable customer push later)
export async function notifyCustomerStatus(db, userId, orderId, status) {
  await addDoc(collection(db, `users/${userId}/notifications`), {
    title: `Order ${status}`,
    body: `Your order #${orderId.substring(0,6)} is ${status} - Delivery all over Kerala`,
    status: status,
    orderId: orderId,
    createdAt: serverTimestamp(),
    read: false
  });
}

/*
FIREBASE CLOUD FUNCTION - Deploy this in Firebase Functions to auto send FCM push
Place in functions/index.js and deploy with firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushOnNewNotification = functions.firestore
  .document('admin_notifications/{notifId}')
  .onCreate(async (snap, context) => {
    const notif = snap.data();
    
    // Get admin tokens
    const tokensSnap = await admin.firestore().collection('admin_tokens').get();
    const tokens = [];
    tokensSnap.forEach(doc => {
      if (doc.data().token) tokens.push(doc.data().token);
    });

    if (tokens.length === 0) return null;

    const message = {
      notification: {
        title: notif.title,
        body: notif.body
      },
      data: {
        orderId: notif.orderId || '',
        type: notif.type || 'new_order'
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Push sent:', response.successCount, 'success');
    return null;
  });
*/
