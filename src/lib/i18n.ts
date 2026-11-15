import type { LanguageCode, SupportCategoryId } from './types';

export interface TranslationSchema {
  brandName: string;
  nav: {
    home: string;
    getSupport: string;
    caseworker: string;
    research: string;
    about: string;
  };
  quickExit: string;
  quickExitHint: string;
  emergencyBanner: string;
  disclaimerExact: string;
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    talkCta: string;
    secondaryCta: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{ num: string; title: string; body: string }>;
  };
  categoriesSection: {
    title: string;
    subtitle: string;
  };
  categories: Record<SupportCategoryId, { label: string; shortDesc: string }>;
  safetySection: {
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  intake: {
    title: string;
    subtitle: string;
    privacyReassurance: string;
    englishClassifierNote: string;
    modeWrite: string;
    modeTalk: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    subCityLabel: string;
    minorCheckbox: string;
    gpsButton: string;
    submitButton: string;
    analyzingButton: string;
    resultsTitle: string;
    urgencyNotice: string;
    uncertaintyTitle: string;
    centersTitle: string;
    referralTitle: string;
    referralSubtitle: string;
    consentCheckbox: string;
    sendReferralButton: string;
    minorSafeguardingNote: string;
  };
  footer: {
    prototypeNote: string;
    languageNotice: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  en: {
    brandName: 'OneDoor',
    nav: {
      home: 'Home',
      getSupport: 'Get Support',
      caseworker: 'Caseworker View',
      research: 'ML Research',
      about: 'About & Safety',
    },
    quickExit: 'Quick Exit',
    quickExitHint: 'Leaves this site immediately (does not clear browser history).',
    emergencyBanner:
      'OneDoor is a prototype and is not an emergency service. If you are in immediate physical danger, please contact local emergency responders or a trusted person nearby.',
    disclaimerExact: 'This project is a prototype and is not medical advice.',
    hero: {
      kicker: 'Addis Ababa Support Prototype · Confidential by Design',
      title: 'One calm doorway to the right support, without repeating your story.',
      subtitle:
        'Describe what happened in your own words by typing or using the voice assistant. Our trained classifier organizes possible support needs, matches nearby synthetic demo centers, and shares nothing unless you review and approve it first.',
      primaryCta: 'Report an Incident',
      talkCta: 'Use Voice Assistant (Demo)',
      secondaryCta: 'View Caseworker Demo',
    },
    howItWorks: {
      title: 'What to expect when you open OneDoor',
      subtitle:
        'You stay in control at every step. Share only what feels safe—no account or identifying name is required.',
      steps: [
        {
          num: '01.',
          title: 'Share at your own pace',
          body: 'Type or speak what happened. You may skip names, addresses, or any detail you prefer to keep private.',
        },
        {
          num: '02.',
          title: 'Review organized support needs',
          body: 'A trained ML model groups possible medical, safety, legal, psychological, or social needs and clearly flags uncertainty.',
        },
        {
          num: '03.',
          title: 'Approve what gets shared',
          body: 'Edit your short referral summary, choose a center, and decide explicitly whether to send a simulated referral.',
        },
      ],
    },
    categoriesSection: {
      title: 'Six support pathways OneDoor helps organize',
      subtitle:
        'Whether you need urgent care, someone to talk to, or practical legal or housing guidance, OneDoor translates plain language into clear next steps.',
    },
    categories: {
      medical_support: {
        label: 'Medical support',
        shortDesc: 'Confidential treatment for injuries, pain, emergency contraception, or PEP triage.',
      },
      psychological_support: {
        label: 'Psychological support',
        shortDesc: 'Trauma-informed counseling, panic stabilization, and emotional care.',
      },
      protection_safeguarding: {
        label: 'Protection & safeguarding',
        shortDesc: 'Immediate safety planning, safe shelter access, and youth safeguarding.',
      },
      legal_support: {
        label: 'Legal support',
        shortDesc: 'Guidance on protection orders, workplace harassment, custody, and reporting rights.',
      },
      sexual_violence_support: {
        label: 'Sexual-violence support',
        shortDesc: 'Specialized survivor-centered clinical care, forensic options, and crisis advocacy.',
      },
      social_support: {
        label: 'Social support',
        shortDesc: 'Temporary housing, emergency food or transport fare, childcare, and job linkages.',
      },
    },
    safetySection: {
      title: 'Built around survivor autonomy and honest AI limits',
      items: [
        {
          title: 'Never decides for you',
          body: 'OneDoor never tells you to flee, stay, confront someone, or file a report. Qualified human professionals and you remain in charge.',
        },
        {
          title: 'Explicit consent only',
          body: 'Nothing is forwarded to any helping center until you read, edit, and explicitly approve the exact referral text.',
        },
        {
          title: 'Visible model uncertainty',
          body: 'When confidence is low—such as short or indirect messages—OneDoor tells you honestly and still shows full support options.',
        },
      ],
    },
    intake: {
      title: 'Share what happened',
      subtitle:
        'Share only what you feel comfortable sharing. No account is needed, and we do not log your text on the server.',
      privacyReassurance:
        'You do not need to share your real name, phone number, or exact address. You can edit or cancel before anything is shared.',
      englishClassifierNote:
        'Model note: The UI supports English and Amharic, while the trained ML classifier currently evaluates English descriptions.',
      modeWrite: 'Write description',
      modeTalk: 'Talk (Simulated Voice)',
      descriptionLabel: 'What happened or what kind of help are you looking for?',
      descriptionPlaceholder:
        'For example: "My partner hit me last night in Bole and took my phone. I need a safe place tonight and someone to check my wrist."',
      subCityLabel: 'Addis Ababa sub-city (optional, manual by default)',
      minorCheckbox: 'This situation involves someone under age 18 (triggers child safeguarding note)',
      gpsButton: 'Use browser GPS (optional, asks permission)',
      submitButton: 'Organize Support Options',
      analyzingButton: 'Organizing support needs...',
      resultsTitle: 'Suggested Support Pathways',
      urgencyNotice:
        'Possible time-sensitive urgency detected by the prototype model. This is not a professional assessment—if you are in immediate danger, seek local emergency help or a trusted person nearby.',
      uncertaintyTitle: 'Model transparency & uncertainty',
      centersTitle: 'Matched Helping Centers (Synthetic Demo Directory)',
      referralTitle: 'Review & Edit Referral Summary',
      referralSubtitle:
        'Only the exact fields you approve below will appear in the simulated helping-center dashboard.',
      consentCheckbox:
        'I have reviewed the summary above and explicitly approve sharing these selected details with the chosen demo helping center.',
      sendReferralButton: 'Approve & Send Demo Referral',
      minorSafeguardingNote:
        'Safeguarding notice: Additional child-protection procedures apply whenever a minor (under 18) is affected. Real-world deployment requires trained child-safeguarding specialists.',
    },
    footer: {
      prototypeNote: 'All centers, referrals, and caseworker views in this prototype use clearly marked synthetic demonstration data.',
      languageNotice: 'UI available in English and አማርኛ · Classifier trained on English text.',
    },
  },
  am: {
    brandName: 'OneDoor',
    nav: {
      home: 'መነሻ',
      getSupport: 'ድጋፍ ያግኙ',
      caseworker: 'የባለሙያ እይታ',
      research: 'የሞዴል ግምገማ',
      about: 'ስለ እኛ እና ደህንነት',
    },
    quickExit: 'በፍጥነት ውጣ',
    quickExitHint: 'ይህን ገጽ ወዲያውኑ ይዘጋል (የአሳሽ ታሪክን አያጠፋም)።',
    emergencyBanner:
      'OneDoor የሙከራ ፕሮጀክት ነው፤ የድንገተኛ አደጋ አገልግሎት አይደለም። አስቸኳይ አካላዊ አደጋ ላይ ከሆኑ እባክዎ የአካባቢዎን የድንገተኛ እርዳታ ወይም የታመነ ሰው ያግኙ።',
    disclaimerExact: 'This project is a prototype and is not medical advice.',
    hero: {
      kicker: 'አዲስ አበባ የድጋፍ ሙከራ · ግላዊነትን የሚጠብቅ',
      title: 'ታሪክዎን ደጋግመው ሳይነግሩ ትክክለኛውን ድጋፍ የሚያገኙበት አንድ በር።',
      subtitle:
        'የሆነውን ነገር በመጻፍ ወይም በድምፅ ይግለጹ። የሰለጠነው የML ሞዴላችን የሚያስፈልጉ ድጋፎችን ያደራጃል፤ እርስዎ ካላጸደቁ በቀር ምንም መረጃ አይጋራም።',
      primaryCta: 'ድጋፍ ጠይቅ',
      talkCta: 'በድምፅ ይናገሩ (ሙከራ)',
      secondaryCta: 'የባለሙያ ዳሽቦርድ',
    },
    howItWorks: {
      title: 'OneDoor እንዴት እንደሚሰራ',
      subtitle: 'በእያንዳንዱ እርምጃ ሙሉ ቁጥጥር አለዎት። ምቹ የሆነውን ብቻ ያጋሩ፤ መለያ አያስፈልግም።',
      steps: [
        {
          num: '01.',
          title: 'በራስዎ ፍጥነት ይግለጹ',
          body: 'የሆነውን ይጻፉ ወይም ይናገሩ። ስም ወይም ትክክለኛ አድራሻ መስጠት አያስፈልግም።',
        },
        {
          num: '02.',
          title: 'የተደራጁ የድጋፍ ፍላጎቶችን ይመልከቱ',
          body: 'የML ሞዴሉ የህክምና፣ የደህንነት፣ የህግ ወይም የስነ-ልቦና ድጋፍ አማራጮችን ከእርግጠኝነት መጠን ጋር ያሳያል።',
        },
        {
          num: '03.',
          title: 'የሚጋራውን መረጃ ያጽድቁ',
          body: 'አጭር ማጠቃለያውን ያርሙ፣ ማዕከል ይምረጡ እና ሲፈቅዱ ብቻ የሙከራ ማስተላለፊያ ይላኩ።',
        },
      ],
    },
    categoriesSection: {
      title: 'OneDoor የሚያደራጃቸው ስድስት የድጋፍ መንገዶች',
      subtitle: 'የህክምና እርዳታ፣ የስነ-ልቦና ምክር ወይም የህግ እና የመጠለያ መረጃ ቢያስፈልግዎ ወደ ትክክለኛው አቅጣጫ ይመራዎታል።',
    },
    categories: {
      medical_support: {
        label: 'የህክምና ድጋፍ',
        shortDesc: 'ለጉዳት፣ ለህመም፣ ለድንገተኛ መከላከያ ወይም ለPEP የህክምና ምርመራ።',
      },
      psychological_support: {
        label: 'የስነ-ልቦና ድጋፍ',
        shortDesc: 'ከአደጋ በኋላ የምክር አገልግሎት፣ ጭንቀትን ማረጋጋት እና ስሜታዊ ድጋፍ።',
      },
      protection_safeguarding: {
        label: 'ጥበቃ እና ደህንነት',
        shortDesc: 'አስቸኳይ የደህንነት እቅድ፣ ጊዜያዊ መጠለያ እና የህጻናት ጥበቃ።',
      },
      legal_support: {
        label: 'የህግ ድጋፍ',
        shortDesc: 'ስለ ጥበቃ ትዕዛዝ፣ የስራ ቦታ ትንኮሳ እና የህግ መብቶች ምክር።',
      },
      sexual_violence_support: {
        label: 'የጾታዊ ጥቃት ድጋፍ',
        shortDesc: 'ለጾታዊ ጥቃት ተጎጂዎች ልዩ የህክምና እና የቀውስ ድጋፍ።',
      },
      social_support: {
        label: 'ማህበራዊ ድጋፍ',
        shortDesc: 'ጊዜያዊ መጠለያ፣ የምግብ እና የትራንስፖርት እርዳታ እና የስራ ትስስር።',
      },
    },
    safetySection: {
      title: 'በተጎጂዎች ራስን የመወሰን መብት እና ግልጽ የAI ገደብ ላይ የተገነባ',
      items: [
        {
          title: 'በእርስዎ ፈንታ አይወስንም',
          body: 'OneDoor እንዲሸሹ ወይም ሪፖርት እንዲያደርጉ አያዝዝም። ውሳኔው ሁልጊዜ የእርስዎ እና የሰለጠኑ ባለሙያዎች ነው።',
        },
        {
          title: 'ግልጽ ፈቃድ ብቻ',
          body: 'እርስዎ አንብበው፣ አርመው እና ካላጸደቁ በቀር ምንም መረጃ ወደ የትኛውም ማዕከል አይላክም።',
        },
        {
          title: 'ግልጽ የሞዴል እርግጠኝነት',
          body: 'ሞዴሉ እርግጠኛ ካልሆነ በግልጽ ይነግርዎታል፤ የድጋፍ አማራጮችንም በፍጹም አይከለክልም።',
        },
      ],
    },
    intake: {
      title: 'የሆነውን ያጋሩ',
      subtitle: 'ለማጋራት ምቹ የሆነውን ብቻ ይጻፉ። መለያ አያስፈልግም፤ ጽሁፍዎ በሰርቨር ላይ አይመዘገብም።',
      privacyReassurance:
        'እውነተኛ ስምዎን፣ ስልክዎን ወይም ትክክለኛ አድራሻዎን መስጠት አያስፈልግዎትም። ከመጋራቱ በፊት ማርም ወይም መሰረዝ ይችላሉ።',
      englishClassifierNote:
        'ማሳሰቢያ፡ ገጹ በአማርኛ እና በእንግሊዝኛ ቢሰራም፣ የML ሞዴሉ የሰለጠነው በእንግሊዝኛ ጽሁፎች ላይ ብቻ ነው።',
      modeWrite: 'በጽሁፍ ይግለጹ',
      modeTalk: 'በድምፅ ይናገሩ (ሙከራ)',
      descriptionLabel: 'ምን ተፈጠረ ወይም ምን ዓይነት ድጋፍ ይፈልጋሉ?',
      descriptionPlaceholder: 'ምሳሌ፡ "My partner hit me last night in Bole..." (ML classifier uses English text)',
      subCityLabel: 'የአዲስ አበባ ክፍለ ከተማ (አማራጭ)',
      minorCheckbox: 'ጉዳዩ ከ18 ዓመት በታች የሆነን ሰው ይመለከታል (የህጻናት ጥበቃ ማሳሰቢያ)',
      gpsButton: 'የአካባቢ GPS ይጠቀሙ (ፈቃድ ይጠይቃል)',
      submitButton: 'የድጋፍ አማራጮችን አደራጅ',
      analyzingButton: 'የድጋፍ ፍላጎቶችን በማደራጀት ላይ...',
      resultsTitle: 'የተጠቆሙ የድጋፍ መንገዶች',
      urgencyNotice:
        'ሞዴሉ አፋጣኝ ትኩረት ሊያስፈልገው የሚችል ሁኔታ ጠቁሟል። ይህ የባለሙያ ምርመራ አይደለም—አስቸኳይ አደጋ ላይ ከሆኑ በአካባቢዎ ያለ የድንገተኛ እርዳታ ይፈልጉ።',
      uncertaintyTitle: 'የሞዴል ግልጽነት እና እርግጠኝነት',
      centersTitle: 'የተመረጡ የድጋፍ ማዕከላት (የሙከራ ዝርዝር)',
      referralTitle: 'የማስተላለፊያ ማጠቃለያውን ይገምግሙ እና ያርሙ',
      referralSubtitle: 'ከዚህ በታች ያጸደቋቸው መረጃዎች ብቻ በሙከራ የባለሙያ ዳሽቦርድ ላይ ይታያሉ።',
      consentCheckbox:
        'ከላይ ያለውን ማጠቃለያ አንብቤያለሁ፤ የተመረጡት ዝርዝሮች ለተመረጠው የሙከራ ማዕከል እንዲጋሩ በግልጽ ፈቅጃለሁ።',
      sendReferralButton: 'ፈቅድ እና የሙከራ ማስተላለፊያ ላክ',
      minorSafeguardingNote:
        'የህጻናት ጥበቃ ማሳሰቢያ፡ ከ18 ዓመት በታች የሆኑ ልጆች ሲካተቱ ተጨማሪ የህጻናት ጥበቃ ሂደቶች ያስፈልጋሉ።',
    },
    footer: {
      prototypeNote: 'በዚህ ሙከራ ውስጥ ያሉ ሁሉም ማዕከላት እና ማስተላለፊያዎች ሰው ሰራሽ የሙከራ ናሙናዎች ናቸው።',
      languageNotice: 'በእንግሊዝኛ እና በአማርኛ · ሞዴሉ በእንግሊዝኛ ብቻ የሰለጠነ ነው።',
    },
  },
};
