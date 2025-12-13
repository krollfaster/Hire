// ===== TYPES =====

export interface Skill {
    id: string;
    name: string;
    weight: number; // 0-1
    category: 'design' | 'engineering' | 'leadership' | 'communication' | 'domain';
}

export interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null; // null = текущая работа
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    year: string;
}

export interface Contacts {
    email: string;
    phone: string;
    linkedin: string;
    telegram: string;
}

export interface User {
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    contacts: Contacts;
    location: string;
    relocatable: boolean;
    workHistory: WorkExperience[];
    education: Education[];
    semanticProfile: Skill[];
    stats: {
        searchAppearances: number[];
        profileViews: number;
        vibeMatchScore: number;
    };
    recentActivity: Activity[];
}

export interface Activity {
    id: string;
    type: 'view' | 'match' | 'message';
    recruiter: {
        name: string;
        company: string;
        avatar: string;
    };
    timestamp: string;
}

export interface Message {
    id: string;
    sender: 'user' | 'recruiter';
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    recruiter: {
        id: string;
        name: string;
        company: string;
        avatar: string;
        role: string;
    };
    messages: Message[];
    unread: number;
    lastActive: string;
}

export interface Candidate {
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    semanticProfile: Skill[];
    matchScore: number;
    matchExplanation: string;
}

// ===== MOCK DATA =====

// Пустой пользователь для начала заполнения профиля
export const emptyUser: User = {
    id: '1',
    name: '',
    role: '',
    avatar: '',
    bio: '',
    contacts: {
        email: '',
        phone: '',
        linkedin: '',
        telegram: '',
    },
    location: '',
    relocatable: false,
    workHistory: [],
    education: [],
    semanticProfile: [],
    stats: {
        searchAppearances: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        profileViews: 0,
        vibeMatchScore: 0,
    },
    recentActivity: [],
};

export const mockUser: User = {
    id: '1',
    name: 'Алексей Петров',
    role: 'Senior Product Designer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Дизайн-лидер с 8+ годами опыта создания пользовательских интерфейсов для B2B SaaS продуктов. Ранее в Figma, сейчас строю будущее дизайн-инструментов.',
    contacts: {
        email: 'alexey.petrov@email.com',
        phone: '+7 (999) 123-45-67',
        linkedin: 'linkedin.com/in/alexeypetrov',
        telegram: '@alexey_petrov',
    },
    location: 'Москва, Россия',
    relocatable: true,
    workHistory: [
        {
            id: 'w1',
            company: 'Figma',
            position: 'Senior Product Designer',
            startDate: '2021-03',
            endDate: null,
        },
        {
            id: 'w2',
            company: 'Яндекс',
            position: 'Product Designer',
            startDate: '2018-06',
            endDate: '2021-02',
        },
        {
            id: 'w3',
            company: 'Mail.ru Group',
            position: 'UI Designer',
            startDate: '2016-01',
            endDate: '2018-05',
        },
    ],
    education: [
        {
            id: 'e1',
            institution: 'МГУ им. М.В. Ломоносова',
            degree: 'Магистр',
            field: 'Прикладная математика и информатика',
            year: '2016',
        },
        {
            id: 'e2',
            institution: 'Школа дизайна ВШЭ',
            degree: 'Сертификат',
            field: 'UX/UI Дизайн',
            year: '2017',
        },
    ],
    semanticProfile: [
        { id: '1', name: 'UI Дизайн', weight: 0.95, category: 'design' },
        { id: '2', name: 'Дизайн-системы', weight: 0.92, category: 'design' },
        { id: '3', name: 'Прототипирование', weight: 0.88, category: 'design' },
        { id: '4', name: 'UX Исследования', weight: 0.82, category: 'design' },
        { id: '5', name: 'React', weight: 0.75, category: 'engineering' },
        { id: '6', name: 'TypeScript', weight: 0.68, category: 'engineering' },
        { id: '7', name: 'Лидерство', weight: 0.85, category: 'leadership' },
        { id: '8', name: 'Менторство', weight: 0.78, category: 'leadership' },
        { id: '9', name: 'Работа со стейкхолдерами', weight: 0.72, category: 'communication' },
        { id: '10', name: 'B2B SaaS', weight: 0.9, category: 'domain' },
    ],
    stats: {
        searchAppearances: [12, 19, 24, 31, 28, 45, 52, 48, 61, 58, 72, 85],
        profileViews: 847,
        vibeMatchScore: 92,
    },
    recentActivity: [
        {
            id: '1',
            type: 'view',
            recruiter: { name: 'Анна Смирнова', company: 'Яндекс', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
            timestamp: '2 часа назад',
        },
        {
            id: '2',
            type: 'match',
            recruiter: { name: 'Дмитрий Ким', company: 'VK', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
            timestamp: '5 часов назад',
        },
        {
            id: '3',
            type: 'message',
            recruiter: { name: 'Елена Волкова', company: 'Сбер', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
            timestamp: 'Вчера',
        },
        {
            id: '4',
            type: 'view',
            recruiter: { name: 'Михаил Козлов', company: 'Тинькофф', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
            timestamp: 'Вчера',
        },
    ],
};

export const mockConversations: Conversation[] = [
    {
        id: '1',
        recruiter: {
            id: 'r1',
            name: 'Анна Смирнова',
            company: 'Яндекс',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
            role: 'Руководитель дизайн-рекрутинга',
        },
        messages: [
            { id: 'm1', sender: 'recruiter', text: 'Привет, Алексей! Я изучила ваш семантический профиль и впечатлена вашей экспертизой в дизайн-системах.', timestamp: '10:30' },
            { id: 'm2', sender: 'recruiter', text: 'Мы строим что-то особенное в Яндексе и думаю, вы бы отлично подошли. Готовы к короткому созвону?', timestamp: '10:31' },
            { id: 'm3', sender: 'user', text: 'Привет, Анна! Спасибо за сообщение. С удовольствием послушаю, над чем вы работаете.', timestamp: '11:45' },
            { id: 'm4', sender: 'recruiter', text: 'Отлично! Мы запускаем новую линейку продуктов для дизайнеров. Ваши навыки React + дизайн — именно то, что нам нужно.', timestamp: '11:52' },
        ],
        unread: 1,
        lastActive: '11:52',
    },
    {
        id: '2',
        recruiter: {
            id: 'r2',
            name: 'Дмитрий Ким',
            company: 'VK',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            role: 'Engineering Manager',
        },
        messages: [
            { id: 'm5', sender: 'recruiter', text: 'Ваш профиль привлёк моё внимание. То, как ИИ извлёк навык "дизайн-мышление в инженерии" — точно в цель.', timestamp: 'Вчера' },
            { id: 'm6', sender: 'user', text: 'Спасибо! Я уверен, что лучшие продукты создаются в командах, где дизайн и инженерия работают вместе.', timestamp: 'Вчера' },
        ],
        unread: 0,
        lastActive: 'Вчера',
    },
    {
        id: '3',
        recruiter: {
            id: 'r3',
            name: 'Елена Волкова',
            company: 'Сбер',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            role: 'VP of Product',
        },
        messages: [
            { id: 'm7', sender: 'recruiter', text: 'Алексей, мы переосмысляем взаимодействие разработчиков и дизайнеров. Интересно?', timestamp: '5 дек' },
        ],
        unread: 1,
        lastActive: '5 дек',
    },
];

export const mockCandidates: Candidate[] = [
    {
        id: 'c1',
        name: 'Алексей Петров',
        role: 'Senior Product Designer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Дизайн-лидер с 8+ годами опыта в B2B SaaS.',
        semanticProfile: [
            { id: '1', name: 'UI Дизайн', weight: 0.95, category: 'design' },
            { id: '2', name: 'Дизайн-системы', weight: 0.92, category: 'design' },
            { id: '5', name: 'React', weight: 0.75, category: 'engineering' },
        ],
        matchScore: 94,
        matchExplanation: 'Сильные навыки дизайн-код. Опыт с Figma напрямую соответствует вашим требованиям.',
    },
    {
        id: 'c2',
        name: 'Мария Родригес',
        role: 'Full-Stack Engineer',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        bio: 'Инженер с дизайнерским мышлением. Одержима pixel-perfect реализациями.',
        semanticProfile: [
            { id: '1', name: 'React', weight: 0.95, category: 'engineering' },
            { id: '2', name: 'UI Implementation', weight: 0.9, category: 'engineering' },
            { id: '3', name: 'Понимание дизайна', weight: 0.85, category: 'design' },
        ],
        matchScore: 87,
        matchExplanation: 'Редкий инженер, понимающий нюансы дизайна. В историях упоминает "одержимость деталями в 1px".',
    },
    {
        id: 'c3',
        name: 'Джеймс Парк',
        role: 'UX Researcher',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        bio: 'Связываю пользовательские инсайты с продуктовой стратегией. Data-driven, но с эмпатией.',
        semanticProfile: [
            { id: '1', name: 'UX Исследования', weight: 0.95, category: 'design' },
            { id: '2', name: 'Анализ данных', weight: 0.88, category: 'engineering' },
            { id: '3', name: 'Коммуникация', weight: 0.82, category: 'communication' },
        ],
        matchScore: 72,
        matchExplanation: 'Сильное исследовательское бэкграунд, но меньше практического опыта в дизайне.',
    },
    {
        id: 'c4',
        name: 'София Тёрнер',
        role: 'Design Engineer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        bio: 'Где искусство встречается с кодом. Создаю интерактивные экспириенсы, которые удивляют.',
        semanticProfile: [
            { id: '1', name: 'Creative Coding', weight: 0.92, category: 'engineering' },
            { id: '2', name: 'Анимации', weight: 0.9, category: 'design' },
            { id: '3', name: 'Three.js', weight: 0.85, category: 'engineering' },
        ],
        matchScore: 81,
        matchExplanation: 'Исключительна в интерактивных/анимированных экспириенсах. Может поднять "вау-фактор" продукта.',
    },
];

// ===== SKILL KEYWORDS FOR AI SIMULATION =====

export const skillKeywords: Record<string, { name: string; category: Skill['category'] }> = {
    // Дизайн
    'дизайн': { name: 'UI Дизайн', category: 'design' },
    'figma': { name: 'Figma', category: 'design' },
    'ui': { name: 'UI Дизайн', category: 'design' },
    'ux': { name: 'UX Дизайн', category: 'design' },
    'прототип': { name: 'Прототипирование', category: 'design' },
    'макет': { name: 'Макетирование', category: 'design' },
    'исследование': { name: 'UX Исследования', category: 'design' },
    'дизайн-система': { name: 'Дизайн-системы', category: 'design' },
    'типографика': { name: 'Типографика', category: 'design' },
    'визуал': { name: 'Визуальный дизайн', category: 'design' },

    // Инженерия
    'react': { name: 'React', category: 'engineering' },
    'typescript': { name: 'TypeScript', category: 'engineering' },
    'javascript': { name: 'JavaScript', category: 'engineering' },
    'код': { name: 'Программирование', category: 'engineering' },
    'фронтенд': { name: 'Frontend разработка', category: 'engineering' },
    'api': { name: 'API интеграция', category: 'engineering' },
    'база данных': { name: 'Базы данных', category: 'engineering' },
    'python': { name: 'Python', category: 'engineering' },
    'node': { name: 'Node.js', category: 'engineering' },

    // Лидерство
    'руководил': { name: 'Лидерство', category: 'leadership' },
    'управлял': { name: 'Управление', category: 'leadership' },
    'команда': { name: 'Командная работа', category: 'leadership' },
    'ментор': { name: 'Менторство', category: 'leadership' },
    'найм': { name: 'Найм', category: 'leadership' },
    'стратегия': { name: 'Стратегическое мышление', category: 'leadership' },

    // Коммуникация
    'презентация': { name: 'Презентации', category: 'communication' },
    'стейкхолдер': { name: 'Работа со стейкхолдерами', category: 'communication' },
    'воркшоп': { name: 'Фасилитация воркшопов', category: 'communication' },
    'документация': { name: 'Документация', category: 'communication' },

    // Домен
    'saas': { name: 'B2B SaaS', category: 'domain' },
    'b2b': { name: 'B2B продукты', category: 'domain' },
    'финтех': { name: 'Финтех', category: 'domain' },
    'здравоохранение': { name: 'Здравоохранение', category: 'domain' },
    'e-commerce': { name: 'E-commerce', category: 'domain' },
};
