import { ChatMessageItem, IntegrationItem } from '../types';

export const initialIntegrations: IntegrationItem[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'calendar',
    status: 'connected',
    lastSynced: 'Just now',
    details: 'syncing primary calendar (events & availability)',
    icon: 'calendar',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email',
    status: 'connected',
    lastSynced: '1 min ago',
    details: 'auto-drafting & approval required for sending',
    icon: 'mail',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets (Order Received)',
    category: 'sheets',
    status: 'connected',
    lastSynced: '3 mins ago',
    details: 'Live sync with "Q3_Customer_Orders_2026.xlsx"',
    icon: 'table',
  },
];

export const sampleInvoices = [
  { id: 'INV-2026-884', client: 'Rahim Textiles', item: 'Cotton Fabric 200m', amount: '৳54,000 ($450)', status: 'Overdue (5 days)', email: 'rahim.textiles@gmail.com' },
  { id: 'INV-2026-885', client: 'Chowdhury Traders', item: 'Dyeing & Processing', amount: '৳28,500 ($240)', status: 'Paid', email: 'chowdhury.trad@yahoo.com' },
  { id: 'INV-2026-886', client: 'Green Leaf Cafe', item: 'Uniform Stitching (50 pcs)', amount: '৳35,000 ($290)', status: 'Pending Review', email: 'contact@greenleafcafe.com' },
  { id: 'INV-2026-887', client: 'Dhaka Craft Mart', item: 'Jute Bags Wholesale (500)', amount: '৳82,000 ($680)', status: 'Sent', email: 'procure@dhakacraft.com' },
];

export const initialMessages: ChatMessageItem[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    timestamp: '10:14 AM',
    text: "Hello! I'm BizMate AI, your autonomous small business operations assistant. I'm connected to your Gmail, Google Calendar, and Orders Sheet. How can I help you run your business today?",
    bengaliText: "আসসালামু আলাইকুম! আমি বিজমেট এআই (BizMate AI), আপনার ছোট ব্যবসার স্বয়ংক্রিয় সহযোগী। আমি আপনার জিমেইল, ক্যালেন্ডার এবং অর্ডার শীটের সাথে সরাসরি যুক্ত আছি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
    tags: ['System Active', '3 Integrations Online'],
  },
  {
    id: 'msg-2',
    sender: 'user',
    timestamp: '10:15 AM',
    text: "রহিম সাহেবের বকেয়া পেমেন্টের জন্য একটা রিমাইন্ডার ইমেইল ড্রাফট করো আর আমাকে দেখাও।",
  },
  {
    id: 'msg-3',
    sender: 'assistant',
    timestamp: '10:15 AM',
    text: "I scanned your Google Sheet **'Q3_Customer_Orders_2026'** and retrieved the invoice details for Rahim Textiles. Invoice **#INV-2026-884** is 5 days overdue.",
    bengaliText: "আমি আপনার গুগল শীট **'Q3_Customer_Orders_2026'** চেক করেছি। রহিম টেক্সটাইলসের ইনভয়েস **#INV-2026-884** এর পেমেন্ট ৫ দিন ধরে বকেয়া রয়েছে।",
    keyValues: [
      { label: 'Client / গ্রাহক', value: 'Rahim Textiles (Mr. Rahim)' },
      { label: 'Invoice No.', value: '#INV-2026-884' },
      { label: 'Overdue Amount / বকেয়া টাকা', value: '৳54,000 ($450.00)', highlight: true },
      { label: 'Recipient Email', value: 'rahim.textiles@gmail.com' },
      { label: 'Due Date', value: 'Sept 19, 2026 (5 days ago)' },
    ],
    actionApproval: {
      actionId: 'act-101',
      actionType: 'SEND_EMAIL',
      service: 'Gmail',
      title: 'Dispatch Gentle Payment Reminder Email',
      bengaliPrompt: 'এই কাজটা করতে যাচ্ছি, ঠিক আছে তো?',
      status: 'pending',
      details: {
        recipient: 'rahim.textiles@gmail.com',
        subject: 'Friendly Reminder: Outstanding Invoice #INV-2026-884 (৳54,000)',
        bodyPreview: 'Dear Mr. Rahim,\n\nWe hope this email finds you well. This is a gentle reminder that invoice #INV-2026-884 for ৳54,000 (Cotton Fabric 200m) was due on Sept 19, 2026. Please let us know once the transfer is initiated, or if you need another copy of the invoice.\n\nWarm regards,\nApex Retailers & Manufacturing Ltd.',
        clientName: 'Rahim Textiles',
        amount: '৳54,000',
        invoiceId: 'INV-2026-884',
      },
    },
  },
];
