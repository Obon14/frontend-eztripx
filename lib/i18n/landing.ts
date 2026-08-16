export type Locale = "id" | "en";

export type LandingCopy = {
  nav: {
    discover: string;
    services: string;
    community: string;
    about: string;
    guideDocument: string;
    login: string;
    register: string;
    logout: string;
    orders: string;
    profile: string;
    accountMenu: string;
  };
  orders: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterPending: string;
    filterPaid: string;
    filterFailed: string;
    filterCanceled: string;
    reset: string;
    loading: string;
    loadError: string;
    empty: string;
    emptyHint: string;
    emptyFiltered: string;
    loginRequired: string;
    loginCta: string;
    continuePay: string;
    buyAgain: string;
    preview: string;
    download: string;
    previewLoading: string;
    previewError: string;
    previewPaidHint: string;
    previewUnpaidHint: string;
    noPaymentUrl: string;
    dateLabel: string;
    resultsCount: string;
  };
  profile: {
    title: string;
    subtitle: string;
    email: string;
    role: string;
    name: string;
    namePlaceholder: string;
    photo: string;
    changePhoto: string;
    save: string;
    saving: string;
    saved: string;
    photoHint: string;
    loginRequired: string;
    loginCta: string;
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
    titleFiltered: string;
    titleFilteredHighlight: string;
    buy: string;
    preview: string;
    download: string;
    previewLoading: string;
    previewError: string;
    previewLimitedHint: string;
    previewFullHint: string;
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
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    search: string;
    searchPlaceholder: string;
    clearSearch: string;
    loginToBuy: string;
    buy: string;
    preview: string;
    download: string;
    processing: string;
    priceIdr: string;
    priceUsd: string;
    empty: string;
    emptySearch: string;
    emptyFiltered: string;
    emptyHint: string;
    loadError: string;
    resultsCount: string;
    prevPage: string;
    nextPage: string;
    pageOf: string;
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
    loading: string;
    loadError: string;
    empty: string;
    emptyHint: string;
    guidesLabel: string;
    viewGuides: string;
  };
  testimonials: {
    title: string;
    titleHighlight: string;
    intro: string;
    prev: string;
    next: string;
    items: Array<{
      name: string;
      role: string;
      quote: string;
    }>;
  };
  review: {
    write: string;
    title: string;
    comment: string;
    commentPlaceholder: string;
    name: string;
    role: string;
    rolePlaceholder: string;
    submit: string;
    submitting: string;
    thanks: string;
    pendingNote: string;
    validation: string;
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
      guideDocument: "Guide Document",
      login: "Masuk",
      register: "Daftar",
      logout: "Keluar",
      orders: "Pesanan",
      profile: "Profil",
      accountMenu: "Menu akun",
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
      titleFiltered: "HASIL",
      titleFilteredHighlight: "PENCARIAN",
      buy: "Beli",
      preview: "Lihat preview",
      download: "Download",
      previewLoading: "Memuat PDF…",
      previewError: "Tidak dapat memuat preview.",
      previewLimitedHint: "Preview terbatas: halaman 1–{n}. Beli untuk akses penuh + unduhan.",
      previewFullHint: "Preview lengkap dokumen (tanpa batas halaman).",
      days: "hari",
      loading: "Memuat panduan…",
      empty: "Belum ada panduan tersedia.",
      emptyFiltered: "Tidak ada panduan untuk filter ini. Coba ubah lokasi atau durasi.",
      emptyHint: "Gunakan pencarian di atas atau buka menu Guide Document.",
      loadError: "Gagal memuat panduan.",
      processing: "Memproses…",
      priceUnavailable: "Harga belum tersedia untuk mata uang ini.",
    },
    guides: {
      eyebrow: "Katalog panduan",
      title: "SEMUA",
      titleHighlight: "GUIDE DOCUMENT",
      subtitle:
        "Jelajahi seluruh panduan dokumen perjalanan yang sudah dipublikasikan. Cari judul, lalu beli PDF resmi yang kamu butuhkan.",
      search: "Cari",
      searchPlaceholder: "Cari judul panduan…",
      clearSearch: "Reset",
      loginToBuy: "Masuk untuk membeli",
      buy: "Beli panduan",
      preview: "Lihat preview",
      download: "Download",
      processing: "Memproses…",
      priceIdr: "IDR",
      priceUsd: "USD",
      empty: "Belum ada panduan tersedia.",
      emptySearch: "Tidak ada panduan yang cocok dengan pencarian ini.",
      emptyFiltered: "Tidak ada panduan untuk filter ini. Coba ubah lokasi, durasi, atau kata kunci.",
      emptyHint: "Coba kata kunci lain atau hapus filter pencarian.",
      loadError: "Gagal memuat panduan.",
      resultsCount: "Menampilkan {shown} dari {total} panduan",
      prevPage: "Sebelumnya",
      nextPage: "Berikutnya",
      pageOf: "Halaman {page} / {totalPages}",
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
    orders: {
      title: "Pesanan saya",
      subtitle: "Riwayat pembelian panduan dokumen. Lanjut bayar, pratinjau, atau unduh PDF.",
      searchPlaceholder: "Cari nama panduan…",
      filterAll: "Semua",
      filterPending: "Menunggu bayar",
      filterPaid: "Selesai",
      filterFailed: "Gagal",
      filterCanceled: "Dibatalkan",
      reset: "Reset",
      loading: "Memuat pesanan…",
      loadError: "Gagal memuat pesanan.",
      empty: "Belum ada pesanan.",
      emptyHint: "Beli panduan di halaman Guide Document.",
      emptyFiltered: "Tidak ada pesanan yang cocok.",
      loginRequired: "Masuk untuk melihat pesananmu.",
      loginCta: "Masuk",
      continuePay: "Lanjut bayar",
      buyAgain: "Beli lagi",
      preview: "Pratinjau",
      download: "Unduh",
      previewLoading: "Memuat PDF…",
      previewError: "Pratinjau tidak bisa dimuat.",
      previewPaidHint: "Pratinjau dokumen lengkap.",
      previewUnpaidHint: "Pratinjau terbatas. Bayar untuk akses penuh dan unduh.",
      noPaymentUrl: "Tautan pembayaran tidak tersedia. Buat pesanan baru dari katalog.",
      dateLabel: "Dipesan",
      resultsCount: "Menampilkan {shown} dari {total} pesanan",
    },
    profile: {
      title: "Profil",
      subtitle: "Informasi akun EzTripx kamu.",
      email: "Email",
      role: "Peran",
      name: "Nama",
      namePlaceholder: "Nama tampilan",
      photo: "Foto profil",
      changePhoto: "Ganti foto",
      save: "Simpan",
      saving: "Menyimpan…",
      saved: "Profil tersimpan.",
      photoHint: "JPG, PNG, atau WebP. Maks. 5 MB.",
      loginRequired: "Masuk untuk melihat profil.",
      loginCta: "Masuk",
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
        "Jelajahi peta interaktif kami dan temukan destinasi panduan resmi EzTripx di seluruh dunia.",
      featured: "Grimari",
      loading: "Memuat peta…",
      loadError: "Gagal memuat peta. Coba refresh halaman.",
      empty: "Belum ada pin destinasi.",
      emptyHint: "Publish panduan dengan lokasi (negara/kota) agar muncul di peta.",
      guidesLabel: "panduan",
      viewGuides: "Lihat panduan",
    },
    testimonials: {
      title: "APA KATA",
      titleHighlight: "PETUALANG",
      intro: "Pengalaman nyata dari traveler yang mempercayai EzTripx untuk perjalanan mereka.",
      prev: "Sebelumnya",
      next: "Berikutnya",
      items: [
        {
          name: "Alice Agusta",
          role: "Backpacker",
          quote:
            "Panduan dokumen perjalanan dari EzTripx sangat membantu. Perjalanan saya jadi lebih tenang dan terorganisir.",
        },
        {
          name: "Raka Pratama",
          role: "Family traveler",
          quote:
            "Checklist visanya jelas. Saya tidak perlu menebak dokumen mana yang wajib dibawa untuk trip keluarga.",
        },
        {
          name: "Mei Lin",
          role: "Couple traveler",
          quote:
            "PDF-nya rapi dan langsung bisa dipakai. Hemat waktu riset sebelum berangkat ke Taiwan.",
        },
      ],
    },
    review: {
      write: "Tulis ulasan",
      title: "Ulas panduan ini",
      comment: "Cerita singkat",
      commentPlaceholder: "Bagaimana panduan ini membantumu?",
      name: "Nama tampilan",
      role: "Jenis traveler (opsional)",
      rolePlaceholder: "Contoh: Backpacker",
      submit: "Kirim ulasan",
      submitting: "Mengirim…",
      thanks: "Terima kasih. Ulasanmu menunggu persetujuan admin.",
      pendingNote: "Ulasan menunggu persetujuan.",
      validation: "Isi nama, rating, dan komentar minimal 10 karakter.",
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
      guideDocument: "Guide Document",
      login: "Login",
      register: "Register",
      logout: "Logout",
      orders: "Orders",
      profile: "Profile",
      accountMenu: "Account menu",
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
      titleFiltered: "SEARCH",
      titleFilteredHighlight: "RESULTS",
      buy: "Buy",
      preview: "Preview",
      download: "Download",
      previewLoading: "Loading PDF…",
      previewError: "Could not load preview.",
      previewLimitedHint: "Limited preview: pages 1–{n}. Purchase for full access + download.",
      previewFullHint: "Full document preview (all pages).",
      days: "days",
      loading: "Loading guides…",
      empty: "No guides available yet.",
      emptyFiltered: "No guides match these filters. Try a different location or duration.",
      emptyHint: "Use the search bar above or open the Guide Document menu.",
      loadError: "Failed to load guides.",
      processing: "Processing…",
      priceUnavailable: "Price is not available for this currency.",
    },
    guides: {
      eyebrow: "Guide catalog",
      title: "ALL",
      titleHighlight: "GUIDE DOCUMENTS",
      subtitle:
        "Browse every published travel document guide. Search by title and purchase the official PDF you need.",
      search: "Search",
      searchPlaceholder: "Search guide titles…",
      clearSearch: "Clear",
      loginToBuy: "Sign in to purchase",
      buy: "Buy guide",
      preview: "Preview",
      download: "Download",
      processing: "Processing…",
      priceIdr: "IDR",
      priceUsd: "USD",
      empty: "No guides available yet.",
      emptySearch: "No guides match this search.",
      emptyFiltered: "No guides match these filters. Try a different location, duration, or keyword.",
      emptyHint: "Try another keyword or clear the search.",
      loadError: "Failed to load guides.",
      resultsCount: "Showing {shown} of {total} guides",
      prevPage: "Previous",
      nextPage: "Next",
      pageOf: "Page {page} / {totalPages}",
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
    orders: {
      title: "My orders",
      subtitle: "Your guide purchases. Continue payment, preview, or download the PDF.",
      searchPlaceholder: "Search guide titles…",
      filterAll: "All",
      filterPending: "Awaiting payment",
      filterPaid: "Paid",
      filterFailed: "Failed",
      filterCanceled: "Canceled",
      reset: "Reset",
      loading: "Loading orders…",
      loadError: "Failed to load orders.",
      empty: "No orders yet.",
      emptyHint: "Buy a guide from the Guide Document page.",
      emptyFiltered: "No orders match these filters.",
      loginRequired: "Sign in to see your orders.",
      loginCta: "Sign in",
      continuePay: "Continue payment",
      buyAgain: "Buy again",
      preview: "Preview",
      download: "Download",
      previewLoading: "Loading PDF…",
      previewError: "Could not load preview.",
      previewPaidHint: "Full document preview.",
      previewUnpaidHint: "Limited preview. Pay for full access and download.",
      noPaymentUrl: "Payment link is unavailable. Create a new order from the catalog.",
      dateLabel: "Ordered",
      resultsCount: "Showing {shown} of {total} orders",
    },
    profile: {
      title: "Profile",
      subtitle: "Your EzTripx account details.",
      email: "Email",
      role: "Role",
      name: "Name",
      namePlaceholder: "Display name",
      photo: "Profile photo",
      changePhoto: "Change photo",
      save: "Save",
      saving: "Saving…",
      saved: "Profile saved.",
      photoHint: "JPG, PNG, or WebP. Max 5 MB.",
      loginRequired: "Sign in to see your profile.",
      loginCta: "Sign in",
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
        "Explore our interactive map and discover EzTripx official guide destinations worldwide.",
      featured: "Grimari",
      loading: "Loading map…",
      loadError: "Failed to load the map. Try refreshing the page.",
      empty: "No destination pins yet.",
      emptyHint: "Publish guides with a location (country/city) so they appear on the map.",
      guidesLabel: "guides",
      viewGuides: "View guides",
    },
    testimonials: {
      title: "WHAT ADVENTURERS SAY",
      titleHighlight: "ABOUT US",
      intro: "Real experiences from travelers who trust EzTripx for their journeys.",
      prev: "Previous",
      next: "Next",
      items: [
        {
          name: "Alice Agusta",
          role: "Backpacker",
          quote:
            "EzTripx travel document guides were incredibly helpful. My trip felt calmer and well organized.",
        },
        {
          name: "Raka Pratama",
          role: "Family traveler",
          quote:
            "The visa checklist was clear. I didn’t have to guess which documents to pack for a family trip.",
        },
        {
          name: "Mei Lin",
          role: "Couple traveler",
          quote:
            "The PDF was tidy and ready to use. It saved hours of research before our Taiwan trip.",
        },
      ],
    },
    review: {
      write: "Write a review",
      title: "Review this guide",
      comment: "Short story",
      commentPlaceholder: "How did this guide help you?",
      name: "Display name",
      role: "Traveler type (optional)",
      rolePlaceholder: "e.g. Backpacker",
      submit: "Submit review",
      submitting: "Sending…",
      thanks: "Thanks. Your review is waiting for admin approval.",
      pendingNote: "Review awaiting approval.",
      validation: "Enter a name, rating, and at least 10 characters.",
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
