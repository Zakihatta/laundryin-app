export const createWaLink = (phone: string | null | undefined, orderId: string, type: 'to_partner' | 'to_customer') => {
  if (!phone) return '#'; 

  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) {
    p = '62' + p.slice(1);
  }

  let text = '';
  if (type === 'to_partner') {
    text = `Halo, saya ingin tanya status pesanan LaundryIn ID: #${orderId.slice(0,6)}...`;
  } else {
    text = `Halo Kak, update dari LaundryIn mengenai pesanan ID: #${orderId.slice(0,6)}.`;
  }

  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
};