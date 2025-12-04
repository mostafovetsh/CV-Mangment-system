require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0'
  },
  database: {
    path: process.env.DB_PATH || './database.json'
  },
  upload: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    allowedTypes: ['.pdf', '.doc', '.docx']
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  // Development users (do NOT use plaintext passwords in production)
  users: [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
  ],
  // Pre-defined department categories for better organization
  departmentCategories: [
    {
      name: 'engineering',
      displayName: 'هندسة',
      icon: 'Cpu',
      color: '#0ea5e9',
      description: 'مهندسين برمجيات وتقنية',
      subCategories: ['frontend', 'backend', 'fullstack', 'devops', 'qa']
    },
    {
      name: 'it',
      displayName: 'تكنولوجيا المعلومات',
      icon: 'Server',
      color: '#4299e1',
      description: 'دعم تقني وإدارة شبكات',
      subCategories: ['support', 'network', 'security', 'database']
    },
    {
      name: 'marketing',
      displayName: 'تسويق',
      icon: 'TrendingUp',
      color: '#48bb78',
      description: 'تسويق ومبيعات',
      subCategories: ['digital', 'content', 'sales', 'social-media']
    },
    {
      name: 'hr',
      displayName: 'موارد بشرية',
      icon: 'Users',
      color: '#ed8936',
      description: 'إدارة الموارد البشرية',
      subCategories: ['recruitment', 'training', 'payroll', 'admin']
    },
    {
      name: 'finance',
      displayName: 'مالية',
      icon: 'DollarSign',
      color: '#9f7aea',
      description: 'محاسبة ومالية',
      subCategories: ['accounting', 'audit', 'tax', 'budget']
    },
    {
      name: 'design',
      displayName: 'تصميم',
      icon: 'Palette',
      color: '#f56565',
      description: 'تصميم جرافيك و UI/UX',
      subCategories: ['graphic', 'ui-ux', '3d', 'motion']
    },
    {
      name: 'customer-service',
      displayName: 'خدمة العملاء',
      icon: 'Headphones',
      color: '#38b2ac',
      description: 'دعم ورعاية العملاء',
      subCategories: ['call-center', 'technical-support', 'complaints']
    },
    {
      name: 'operations',
      displayName: 'عمليات',
      icon: 'Settings',
      color: '#718096',
      description: 'إدارة العمليات والخدمات',
      subCategories: ['logistics', 'supply-chain', 'quality']
    },
    {
      name: 'general',
      displayName: 'عام',
      icon: 'Folder',
      color: '#a0aec0',
      description: 'سير ذاتية عامة',
      subCategories: []
    }
  ],
  // CV Status options for tracking
  cvStatuses: [
    { value: 'new', label: 'جديد', color: '#4299e1' },
    { value: 'progress', label: 'قيد التنفيذ', color: '#ed8936' },
    { value: 'complete', label: 'مكتمل', color: '#48bb78' }
  ],
  // UI assets
  logoUrl: process.env.LOGO_URL || '/logo.png'
};
