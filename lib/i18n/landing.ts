export type Locale = "id" | "en";

export type LandingCopy = {
  nav: {
    discover: string;
    services: string;
    community: string;
    about: string;
    login: string;
    register: string;
  };
  hero: {
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    location: string;
    locationValue: string;
    date: string;
    dateValue: string;
    search: string;
  };
  destinations: {
    title: string;
    titleHighlight: string;
    perPerson: string;
    book: string;
  };
  stories: {
    title: string;
    titleHighlight: string;
    p1: string;
    p2: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  map: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    featured: string;
  };
  testimonials: {
    title: string;
    titleHighlight: string;
    intro: string;
    quote: string;
    role: string;
  };
  cta: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    button: string;
  };
  footer: {
    tagline: string;
    about: string;
    movement: string;
    company: string;
    support: string;
    copyright: string;
    terms: string;
    privacy: string;
  };
  auth: {
    loginTitle: string;
    loginDesc: string;
    registerTitle: string;
    registerDesc: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    submitLogin: string;
    submitRegister: string;
    noAccount: string;
    hasAccount: string;
    switchRegister: string;
    switchLogin: string;
    mockSuccess: string;
    validationRequired: string;
    validationEmail: string;
    validationPasswordMatch: string;
  };
};

export const landingCopy: Record<Locale, LandingCopy> = {
  id: {
    nav: {
      discover: "Jelajahi",
      services: "Layanan",
      community: "Komunitas",
      about: "Tentang Kami",
      login: "Masuk",
      register: "Daftar",
    },
    hero: {
      titleLine1: "JALANI",
      titleHighlight: "PETUALANGANMU",
      subtitle:
        "Temukan destinasi, panduan dokumen perjalanan, dan pengalaman petualangan terbaik di seluruh dunia bersama EzTripx.",
      location: "Lokasi",
      locationValue: "Bogor, Indonesia",
      date: "Tanggal",
      dateValue: "18 Agustus 2026",
      search: "Cari",
    },
    destinations: {
      title: "TEMUKAN DESTINASI",
      titleHighlight: "POPULER",
      perPerson: "/Orang",
      book: "Pesan",
    },
    stories: {
      title: "CERITA KAMI BERSAMA",
      titleHighlight: "PETUALANG",
      p1:
        "EzTripx hadir untuk memudahkan perjalananmu dengan panduan dokumen yang jelas dan rekomendasi destinasi terpercaya.",
      p2:
        "Bergabunglah dengan ribuan traveler yang telah merencanakan perjalanan lebih aman dan menyenangkan bersama kami.",
      stat1Value: "12K+",
      stat1Label: "Perjalanan Sukses",
      stat2Value: "16+",
      stat2Label: "Penghargaan",
      stat3Value: "20+",
      stat3Label: "Tahun Pengalaman",
    },
    map: {
      title: "MULAI PETUALANGAN BARU",
      titleHighlight: "DI SELURUH DUNIA",
      subtitle:
        "Jelajahi peta interaktif kami dan temukan titik petualangan favorit dari komunitas EzTripx.",
      featured: "Grimari",
    },
    testimonials: {
      title: "APA KATA",
      titleHighlight: "PETUALANG",
      intro: "Pengalaman nyata dari traveler yang mempercayai EzTripx untuk perjalanan mereka.",
      quote:
        "Panduan dokumen perjalanan dari EzTripx sangat membantu. Perjalanan saya jadi lebih tenang dan terorganisir.",
      role: "Backpacker",
    },
    cta: {
      title: "MULAI BERSAMA",
      titleHighlight: "EZTRIPX",
      subtitle: "Daftar sekarang dan rencanakan petualangan berikutnya dengan lebih mudah.",
      button: "Mulai Sekarang",
    },
    footer: {
      tagline: "Platform perjalanan dan panduan dokumen untuk petualang modern.",
      about: "Tentang",
      movement: "Gerakan",
      company: "Perusahaan",
      support: "Dukungan",
      copyright: "© 2026 EzTripx. Hak cipta dilindungi.",
      terms: "Syarat & Ketentuan",
      privacy: "Kebijakan Privasi",
    },
    auth: {
      loginTitle: "Masuk ke EzTripx",
      loginDesc: "Masuk untuk mengakses perjalanan dan panduan dokumenmu.",
      registerTitle: "Daftar EzTripx",
      registerDesc: "Buat akun untuk mulai merencanakan petualanganmu.",
      name: "Nama lengkap",
      email: "Email",
      password: "Kata sandi",
      confirmPassword: "Konfirmasi kata sandi",
      submitLogin: "Masuk",
      submitRegister: "Daftar",
      noAccount: "Belum punya akun?",
      hasAccount: "Sudah punya akun?",
      switchRegister: "Daftar sekarang",
      switchLogin: "Masuk di sini",
      mockSuccess: "Berhasil! Integrasi akun pengguna akan segera tersedia.",
      validationRequired: "Semua field wajib diisi.",
      validationEmail: "Format email belum valid.",
      validationPasswordMatch: "Konfirmasi kata sandi tidak cocok.",
    },
  },
  en: {
    nav: {
      discover: "Discover",
      services: "Services",
      community: "Community",
      about: "About Us",
      login: "Login",
      register: "Register",
    },
    hero: {
      titleLine1: "LIVE YOUR",
      titleHighlight: "ADVENTURE",
      subtitle:
        "Discover destinations, travel document guides, and the best adventure experiences worldwide with EzTripx.",
      location: "Location",
      locationValue: "Bogor, Indonesia",
      date: "Date",
      dateValue: "18 August 2026",
      search: "Search",
    },
    destinations: {
      title: "FIND POPULAR",
      titleHighlight: "DESTINATIONS",
      perPerson: "/Person",
      book: "Book",
    },
    stories: {
      title: "OUR STORIES WITH",
      titleHighlight: "ADVENTURERS",
      p1:
        "EzTripx makes your journey easier with clear document guides and trusted destination recommendations.",
      p2:
        "Join thousands of travelers who plan safer, more enjoyable trips with us every day.",
      stat1Value: "12K+",
      stat1Label: "Success Journeys",
      stat2Value: "16+",
      stat2Label: "Awards Winning",
      stat3Value: "20+",
      stat3Label: "Years of Experience",
    },
    map: {
      title: "START YOUR NEW ADVENTURE",
      titleHighlight: "AROUND THE WORLD",
      subtitle:
        "Explore our adventure map and discover favorite spots from the EzTripx community.",
      featured: "Grimari",
    },
    testimonials: {
      title: "WHAT ADVENTURERS SAY",
      titleHighlight: "ABOUT US",
      intro: "Real experiences from travelers who trust EzTripx for their journeys.",
      quote:
        "EzTripx travel document guides were incredibly helpful. My trip felt calmer and well organized.",
      role: "Backpacker",
    },
    cta: {
      title: "GET STARTED WITH",
      titleHighlight: "EZTRIPX",
      subtitle: "Sign up today and plan your next adventure with ease.",
      button: "Get Started",
    },
    footer: {
      tagline: "Travel platform and document guides for modern adventurers.",
      about: "About",
      movement: "Movement",
      company: "Company",
      support: "Support",
      copyright: "© 2026 EzTripx. All rights reserved.",
      terms: "Terms & Agreements",
      privacy: "Privacy Policy",
    },
    auth: {
      loginTitle: "Login to EzTripx",
      loginDesc: "Sign in to access your trips and document guides.",
      registerTitle: "Register for EzTripx",
      registerDesc: "Create an account to start planning your adventure.",
      name: "Full name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      submitLogin: "Login",
      submitRegister: "Register",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      switchRegister: "Register now",
      switchLogin: "Login here",
      mockSuccess: "Success! User account integration coming soon.",
      validationRequired: "All fields are required.",
      validationEmail: "Please enter a valid email.",
      validationPasswordMatch: "Passwords do not match.",
    },
  },
};
