export const sampleTenders = [
    // --- IT Infrastructure ---
    {
        tender_id: '1',
        title: 'High-Performance Server Cluster',
        description: 'Supply and installation of 50 high-performance servers for AI data processing center. Specs: 2x AMD EPYC, 512GB RAM, 100TB NVMe.',
        category: 'IT Infrastructure',
        price: 15000000,
        weight: '500kg',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/0f172a/ffffff?text=Server+Cluster',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '10',
        title: 'Enterprise Network Switch Upgrade',
        description: 'Procurement of 200 Cisco Catalyst 9000 switches for campus-wide network refresh.',
        category: 'IT Infrastructure',
        price: 8500000,
        weight: '1200kg',
        quantity: 200,
        image_url: 'https://placehold.co/600x400/0f172a/ffffff?text=Network+Switches',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '11',
        title: 'Data Center Cooling System',
        description: 'Installation of advanced liquid cooling solutions for Tier 4 data center.',
        category: 'IT Infrastructure',
        price: 12000000,
        weight: '3000kg',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/0f172a/ffffff?text=Data+Center+Cooling',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Healthcare ---
    {
        tender_id: '2',
        title: 'Medical Imaging Equipment',
        description: 'Procurement of 3 MRI machines and 5 CT Scanners for City Central Hospital expansion.',
        category: 'Healthcare',
        price: 45000000,
        weight: '12000kg',
        quantity: 8,
        image_url: 'https://placehold.co/600x400/dc2626/ffffff?text=MRI+Scanner',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '12',
        title: 'Surgical Robotics System',
        description: 'Supply of da Vinci Surgical System for minimally invasive surgeries.',
        category: 'Healthcare',
        price: 95000000,
        weight: '800kg',
        quantity: 2,
        image_url: 'https://placehold.co/600x400/dc2626/ffffff?text=Surgical+Robot',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '13',
        title: 'Hospital Bed Fleet',
        description: 'Delivery of 500 electric ICU beds with integrated monitoring systems.',
        category: 'Healthcare',
        price: 7500000,
        weight: '25000kg',
        quantity: 500,
        image_url: 'https://placehold.co/600x400/dc2626/ffffff?text=ICU+Beds',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Education ---
    {
        tender_id: '3',
        title: 'School Furniture Supply',
        description: 'Supply of 5000 student desks and chairs for state schools. Ergonomic design.',
        category: 'Education',
        price: 2500000,
        weight: '25000kg',
        quantity: 5000,
        image_url: 'https://placehold.co/600x400/2563eb/ffffff?text=School+Furniture',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '14',
        title: 'Interactive Smart Boards',
        description: 'Installation of 200 75-inch4K interactive displays for digital classrooms.',
        category: 'Education',
        price: 6000000,
        weight: '8000kg',
        quantity: 200,
        image_url: 'https://placehold.co/600x400/2563eb/ffffff?text=Smart+Boards',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '15',
        title: 'Science Lab Equipment',
        description: 'Complete physics and chemistry lab setup for 10 high schools.',
        category: 'Education',
        price: 3200000,
        weight: '1500kg',
        quantity: 10,
        image_url: 'https://placehold.co/600x400/2563eb/ffffff?text=Science+Lab',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Construction ---
    {
        tender_id: '4',
        title: 'Highway Construction Materials',
        description: 'Supply of 500 tons of industrial grade asphalt and 200 tons of cement.',
        category: 'Construction',
        price: 8000000,
        weight: '700000kg',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/d97706/ffffff?text=Construction+Materials',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '16',
        title: 'Steel Girders for Bridge',
        description: 'Prefabricated high-strength steel girders for the new riverside bridge project.',
        category: 'Construction',
        price: 25000000,
        weight: '500000kg',
        quantity: 40,
        image_url: 'https://placehold.co/600x400/d97706/ffffff?text=Steel+Girders',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '17',
        title: 'Excavation Machinery',
        description: 'Lease of 5 heavy-duty excavators for 6 months site preparation.',
        category: 'Construction',
        price: 4500000,
        weight: 'N/A',
        quantity: 5,
        image_url: 'https://placehold.co/600x400/d97706/ffffff?text=Excavators',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- IT Equipment ---
    {
        tender_id: '5',
        title: 'Corporate Laptop Fleet Upgrade',
        description: 'Purchase of 200 MacBook Pro M3 laptops for engineering department.',
        category: 'IT Equipment',
        price: 35000000,
        weight: '400kg',
        quantity: 200,
        image_url: 'https://placehold.co/600x400/4f46e5/ffffff?text=Laptops',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '18',
        title: 'Professional Workstation Setup',
        description: '100 dual-monitor setups with ergonomic arms and 4K displays.',
        category: 'IT Equipment',
        price: 5000000,
        weight: '1200kg',
        quantity: 100,
        image_url: 'https://placehold.co/600x400/4f46e5/ffffff?text=Workstations',
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Energy ---
    {
        tender_id: '6',
        title: 'Solar Panel Installation Phase 2',
        description: 'Supply and installation of 2MW solar array for industrial park.',
        category: 'Energy',
        price: 12000000,
        weight: '5000kg',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/16a34a/ffffff?text=Solar+Panels',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '19',
        title: 'Industrial Generator Set',
        description: '2000kVA Diesel Generator with soundproof enclosure for backup power.',
        category: 'Energy',
        price: 850000,
        weight: '4000kg',
        quantity: 2,
        image_url: 'https://placehold.co/600x400/16a34a/ffffff?text=Generator',
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Services ---
    {
        tender_id: '7',
        title: 'Office Cleaning Services',
        description: 'Comprehensive cleaning services for 10-story office building. Annual contract.',
        category: 'Services',
        price: 1200000,
        weight: 'N/A',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/9333ea/ffffff?text=Cleaning+Services',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '20',
        title: 'Landscape Maintenance',
        description: 'Maintenance of corporate campus grounds, including lawn care and tree trimming.',
        category: 'Services',
        price: 600000,
        weight: 'N/A',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/9333ea/ffffff?text=Landscaping',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '21',
        title: 'Legal Consultancy',
        description: 'Retainer for corporate compliance and intellectual property legal services.',
        category: 'Services',
        price: 2500000,
        weight: 'N/A',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/9333ea/ffffff?text=Legal+Services',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Security ---
    {
        tender_id: '8',
        title: 'Security System Upgrade',
        description: 'Installation of 500 CCTV cameras and central monitoring station.',
        category: 'Security',
        price: 5500000,
        weight: '1000kg',
        quantity: 1,
        image_url: 'https://placehold.co/600x400/0f172a/ffffff?text=CCTV+System',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '22',
        title: 'Biometric Access Control',
        description: 'Implementation of fingerprint and facial recognition scanners for 50 entry points.',
        category: 'Security',
        price: 1800000,
        weight: '200kg',
        quantity: 50,
        image_url: 'https://placehold.co/600x400/0f172a/ffffff?text=Biometrics',
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },

    // --- Automotive ---
    {
        tender_id: '9',
        title: 'Fleet Vehicles - Electric Vans',
        description: 'Procurement of 20 electric delivery vans for logistics.',
        category: 'Automotive',
        price: 80000000,
        weight: '40000kg',
        quantity: 20,
        image_url: 'https://placehold.co/600x400/b91c1c/ffffff?text=Electric+Vans',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '23',
        title: 'Heavy Duty Cargo Trucks',
        description: 'Lease of 10 Volvo FH16 trucks for cross-border transport.',
        category: 'Automotive',
        price: 150000000,
        weight: 'N/A',
        quantity: 10,
        image_url: 'https://placehold.co/600x400/b91c1c/ffffff?text=Cargo+Trucks',
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '24',
        title: 'CEO Limousine Service',
        description: 'Supply of 2 luxury armored sedans for executive transport.',
        category: 'Automotive',
        price: 4500000,
        weight: '4000kg',
        quantity: 2,
        image_url: 'https://placehold.co/600x400/b91c1c/ffffff?text=Luxury+Sadan',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        tender_id: '25',
        title: 'Forklift Fleet',
        description: 'Purchase of 15 electric warehouse forklifts with high-reach capability.',
        category: 'Automotive',
        price: 7500000,
        weight: '30000kg',
        quantity: 15,
        image_url: 'https://placehold.co/600x400/b91c1c/ffffff?text=Forklifts',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export const sampleOrders = [
    {
        order_id: 'o1',
        tender_id: '1',
        tender_title: 'High-Performance Server Cluster',
        user_id: 'u1',
        user_name: 'Tech Solutions Ltd',
        user_email: 'procurement@techsolutions.com',
        quantity: 1,
        unit_price: 15000000,
        total_price: 15000000,
        status: 'completed',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        order_id: 'o2',
        tender_id: '5',
        tender_title: 'Corporate Laptop Fleet Upgrade',
        user_id: 'u2',
        user_name: 'Global Innovation Corp',
        user_email: 'buyer@globalinno.com',
        quantity: 50,
        unit_price: 175000,
        total_price: 8750000,
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
        order_id: 'o3',
        tender_id: '3',
        tender_title: 'School Furniture Supply',
        user_id: 'u3',
        user_name: 'City Education Board',
        user_email: 'admin@cityedu.gov',
        quantity: 1000,
        unit_price: 500,
        total_price: 500000,
        status: 'approved',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        order_id: 'o4',
        tender_id: '8',
        tender_title: 'Security System Upgrade',
        user_id: 'u4',
        user_name: 'SecureNet Systems',
        user_email: 'ops@securenetsys.com',
        quantity: 1,
        unit_price: 5500000,
        total_price: 5500000,
        status: 'pending',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
];
