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
    region: string;
    country: string;
    city: string;
    duration: string;
    durationPlaceholder: string;
    search: string;
    allRegions: string;
    allCountries: string;
    allCities: string;
    locationPlaceholder: string;
    clearLocation: string;
    locationDone: string;
    pickRegionFirst: string;
    pickCountryFirst: string;
    multiSelectHint: string;
    locationCount: string;
  };
  destinations: {
    title: string;
    titleHighlight: string;
    buy: string;
    days: string;
    loading: string;
    empty: string;
    emptyFiltered: string;
    emptyHint: string;
    loadError: string;
    processing: string;
    priceUnavailable: string;
  };
  guides: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    loginToBuy: string;
    buy: string;
    processing: string;
    priceIdr: string;
    priceUsd: string;
    empty: string;
    loadError: string;
  };
  payment: {
    title: string;
    syncing: string;
    paid: string;
    pending: string;
    failed: string;
    canceled: string;
    backHome: string;
    viewGuide: string;
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
    loginSuccess: string;
    registerSuccess: string;
    validationRequired: string;
    validationEmail: string;
    validationPasswordMatch: string;
    networkError: string;
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
      region: "Wilayah",
      country: "Negara",
      city: "Kota",
      duration: "Durasi",
      durationPlaceholder: "Hari liburan",
      search: "Cari",
      allRegions: "Cari wilayah…",
      allCountries: "Cari negara…",
      allCities: "Cari kota…",
      locationPlaceholder: "Pilih wilayah, negara, atau kota",
      clearLocation: "Reset lokasi",
      locationDone: "Selesai",
      pickRegionFirst: "Pilih wilayah dulu",
      pickCountryFirst: "Pilih negara dulu",
      multiSelectHint: "Bisa pilih lebih dari satu",
      locationCount: "{n} {what}",
    },
    destinations: {
      title: "TEMUKAN DESTINASI",
      titleHighlight: "POPULER",
      buy: "Beli",
      days: "hari",
      loading: "Memuat panduan…",
      empty: "Belum ada panduan tersedia.",
      emptyFiltered: "Tidak ada panduan untuk filter ini. Coba ubah lokasi atau durasi.",
      emptyHint: "Gunakan pencarian di atas atau jelajahi semua panduan.",
      loadError: "Gagal memuat panduan.",
      processing: "Memproses…",
      priceUnavailable: "Harga belum tersedia untuk mata uang ini.",
    },
    guides: {
      title: "PANDUAN DOKUMEN",
      titleHighlight: "PERJALANAN",
      subtitle: "Beli panduan PDF resmi. Setelah pembayaran berhasil, dokumen bisa diakses dari akunmu.",
      loginToBuy: "Masuk untuk membeli",
      buy: "Beli panduan",
      processing: "Memproses…",
      priceIdr: "IDR",
      priceUsd: "USD",
      empty: "Belum ada panduan tersedia.",
      loadError: "Gagal memuat panduan. Pastikan sudah login.",
    },
    payment: {
      title: "Status pembayaran",
      syncing: "Memverifikasi pembayaran…",
      paid: "Pembayaran berhasil. Panduan dikirim ke email Anda dan bisa diakses dari akun.",
      pending: "Pembayaran masih diproses. Coba refresh halaman ini sebentar lagi.",
      failed: "Pembayaran gagal. Silakan buat pesanan baru.",
      canceled: "Pembayaran dibatalkan atau kedaluwarsa.",
      backHome: "Kembali ke beranda",
      viewGuide: "Lihat panduan (perlu login)",
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
      loginSuccess: "Berhasil masuk. Sesi kamu sudah aktif.",
      registerSuccess: "Akun berhasil dibuat. Silakan masuk dengan email dan password kamu.",
      networkError: "Tidak bisa menghubungi server. Coba lagi.",
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
      region: "Region",
      country: "Country",
      city: "City",
      duration: "Duration",
      durationPlaceholder: "Trip days",
      search: "Search",
      allRegions: "Search region…",
      allCountries: "Search country…",
      allCities: "Search city…",
      locationPlaceholder: "Choose region, country, or city",
      clearLocation: "Clear location",
      locationDone: "Done",
      pickRegionFirst: "Select a region first",
      pickCountryFirst: "Select a country first",
      multiSelectHint: "Multiple selection allowed",
      locationCount: "{n} {what}",
    },
    destinations: {
      title: "FIND POPULAR",
      titleHighlight: "DESTINATIONS",
      buy: "Buy",
      days: "days",
      loading: "Loading guides…",
      empty: "No guides available yet.",
      emptyFiltered: "No guides match these filters. Try a different location or duration.",
      emptyHint: "Use the search bar above or browse all available guides.",
      loadError: "Failed to load guides.",
      processing: "Processing…",
      priceUnavailable: "Price is not available for this currency.",
    },
    guides: {
      title: "TRAVEL DOCUMENT",
      titleHighlight: "GUIDES",
      subtitle: "Purchase official PDF guides. After successful payment, access them from your account.",
      loginToBuy: "Sign in to purchase",
      buy: "Buy guide",
      processing: "Processing…",
      priceIdr: "IDR",
      priceUsd: "USD",
      empty: "No guides available yet.",
      loadError: "Failed to load guides. Please sign in first.",
    },
    payment: {
      title: "Payment status",
      syncing: "Verifying payment…",
      paid: "Payment successful. Your guide was sent to your email and is available in your account.",
      pending: "Payment is still processing. Try refreshing this page shortly.",
      failed: "Payment failed. Please create a new order.",
      canceled: "Payment was canceled or expired.",
      backHome: "Back to home",
      viewGuide: "View guides (sign in required)",
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
      loginSuccess: "Signed in successfully. Your session is active.",
      registerSuccess: "Account created. Please sign in with your email and password.",
      networkError: "Could not reach the server. Please try again.",
      validationRequired: "All fields are required.",
      validationEmail: "Please enter a valid email.",
      validationPasswordMatch: "Passwords do not match.",
    },
  },
};
