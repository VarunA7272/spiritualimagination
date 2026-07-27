export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number';
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  options?: string[];
  uppercaseOnBlur?: boolean;
  readonly?: boolean;
}

export interface CardConfig {
  id: string;
  title: string;
  orientation: 'portrait' | 'landscape';
  layoutType: 'classic-center' | 'grid-side' | 'portrait-school-grid' | 'portrait-igs';
  dbTable: string;
  storageBucket: string;
  isSecondaryClient: boolean;
  
  // Storage Enable Flags
  enableDbUploadFlag: 'ENABLE_DB_UPLOAD_CARD1' | 'ENABLE_DB_UPLOAD_CARD2' | 'ENABLE_DB_UPLOAD_CARD3';
  enableLocalDownloadFlag: 'ENABLE_LOCAL_DOWNLOAD_CARD1' | 'ENABLE_LOCAL_DOWNLOAD_CARD2' | 'ENABLE_LOCAL_DOWNLOAD_CARD3';

  // Card Styling Tokens
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    cardBgSvg?: string;
  };

  // Form Fields
  fields: FormFieldConfig[];
}

export const CARD_CONFIGS: Record<string, CardConfig> = {
  'generator': {
    id: 'generator',
    title: 'Demo',
    orientation: 'portrait',
    layoutType: 'classic-center',
    dbTable: 'nursing-collg',
    storageBucket: 'nursing-collg',
    isSecondaryClient: false,
    enableDbUploadFlag: 'ENABLE_DB_UPLOAD_CARD1',
    enableLocalDownloadFlag: 'ENABLE_LOCAL_DOWNLOAD_CARD1',
    theme: {
      primaryColor: '#00b8a9',
      textColor: '#000000',
      cardBgSvg: '/demo.svg'
    },
    fields: [
      {
        name: 'name',
        label: 'Name of Employee',
        type: 'text',
        placeholder: 'e.g. RAHUL SHARMA',
        required: true,
        minLength: 3,
        uppercaseOnBlur: true
      },
      {
        name: 'role',
        label: 'Designation',
        type: 'text',
        placeholder: 'e.g. LECTURER',
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'contact',
        label: 'Contact No',
        type: 'text',
        placeholder: 'e.g. 9876543210',
        required: true,
        pattern: '^\\d{10}$'
      },
      {
        name: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'text',
        placeholder: 'e.g. NC/2026/012',
        uppercaseOnBlur: true
      },
      // {
      //   name: 'address',
      //   label: 'Office Address',
      //   type: 'text',
      //   defaultValue: 'Home Science College Road, Napier Town, Jabalpur (M.P)',
      //   placeholder: 'e.g. Napier Town, Jabalpur',
      //   required: true,
      //   uppercaseOnBlur: true
      // },
      // {
      //   name: 'officeContact',
      //   label: 'Office Contact',
      //   type: 'text',
      //   defaultValue: '0761-4085424',
      //   placeholder: 'e.g. 0761-4085424',
      //   required: true,
      //   uppercaseOnBlur: true
      // }
    ]
  },
  'student-card': {
    id: 'student-card',
    title: 'Raiwada Student Card',
    orientation: 'landscape',
    layoutType: 'grid-side',
    dbTable: 'student-cards',
    storageBucket: 'employee-cards',
    isSecondaryClient: false,
    enableDbUploadFlag: 'ENABLE_DB_UPLOAD_CARD2',
    enableLocalDownloadFlag: 'ENABLE_LOCAL_DOWNLOAD_CARD2',
    theme: {
      cardBgSvg: '/varun2.svg'
    },
    fields: [
      {
        name: 'studentName',
        label: 'Name of the Student',
        type: 'text',
        placeholder: 'e.g. RAHUL SHARMA',
        required: true,
        minLength: 3,
        uppercaseOnBlur: true
      },
      {
        name: 'class',
        label: 'Class',
        type: 'select',
        defaultValue: 'LKG',
        options: ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        required: true
      },
      {
        name: 'section',
        label: 'Section',
        type: 'text',
        placeholder: 'e.g. A',
        uppercaseOnBlur: true
      },
      {
        name: 'fhName',
        label: 'Father\'s Name',
        type: 'text',
        placeholder: 'e.g. MR. RAJESH SHARMA',
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        name: 'session',
        label: 'Session',
        type: 'text',
        defaultValue: '2026-2027',
        readonly: true,
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'idNo',
        label: 'ID Number',
        type: 'text',
        placeholder: 'e.g. NSCB/26/033',
        required: false,
        uppercaseOnBlur: true
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: 'e.g. 9876543210',
        required: true,
        pattern: '^\\d{10}$'
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text',
        placeholder: 'e.g. Phase-II Sunrise Megacity Sagar M.P. 470002',
        required: true,
        uppercaseOnBlur: true
      }
    ]
  },
  'ghs-palasundar-card': {
    id: 'ghs-palasundar-card',
    title: 'GHS Palasundar',
    orientation: 'landscape',
    layoutType: 'grid-side',
    dbTable: 'ghs-palasundar-cards',
    storageBucket: 'ghs-palasundar-cards',
    isSecondaryClient: true,
    enableDbUploadFlag: 'ENABLE_DB_UPLOAD_CARD3',
    enableLocalDownloadFlag: 'ENABLE_LOCAL_DOWNLOAD_CARD3',
    theme: {
      cardBgSvg: '/varun1.svg'
    },
    fields: [
      {
        name: 'studentName',
        label: 'Name of the Student',
        type: 'text',
        placeholder: 'e.g. RAHUL SHARMA',
        required: true,
        minLength: 3,
        uppercaseOnBlur: true,
        maxLength: 25
      },
      {
        name: 'class',
        label: 'Class',
        type: 'select',
        defaultValue: 'LKG',
        options: ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        required: true
      },
      {
        name: 'section',
        label: 'Section',
        type: 'text',
        placeholder: 'e.g. A',
        uppercaseOnBlur: true
      },
      {
        name: 'fhName',
        label: 'Father\'s Name',
        type: 'text',
        placeholder: 'e.g. MR. RAJESH SHARMA',
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        name: 'session',
        label: 'Session',
        type: 'text',
        defaultValue: '2026-2027',
        readonly: true,
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'idNo',
        label: 'ID Number',
        type: 'text',
        placeholder: 'e.g. MPS/26/101',
        required: false,
        uppercaseOnBlur: true
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: 'e.g. 9876543210',
        required: true,
        pattern: '^\\d{10}$'
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text',
        placeholder: 'e.g. Suhagi, Jabalpur M.P.',
        required: true,
        uppercaseOnBlur: true,
        maxLength: 40
      }
    ]
  },
  'mps-card': {
    id: 'mps-card',
    title: 'Moral Public School',
    orientation: 'portrait',
    layoutType: 'portrait-school-grid',
    dbTable: 'mps-cards',
    storageBucket: 'mps-cards',
    isSecondaryClient: true,
    enableDbUploadFlag: 'ENABLE_DB_UPLOAD_CARD3',
    enableLocalDownloadFlag: 'ENABLE_LOCAL_DOWNLOAD_CARD3',
    theme: {
      cardBgSvg: '/mps1.svg'
    },
    fields: [
      {
        name: 'studentName',
        label: 'Name of the Student',
        type: 'text',
        placeholder: 'e.g. RAHUL SHARMA',
        required: true,
        minLength: 3,
        maxLength: 30,
        uppercaseOnBlur: true
      },
      // {
      //   name: 'class',
      //   label: 'Class',
      //   type: 'select',
      //   defaultValue: 'LKG',
      //   options: ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      //   required: true
      // },
      // {
      //   name: 'section',
      //   label: 'Section',
      //   type: 'text',
      //   placeholder: 'e.g. A',
      //   uppercaseOnBlur: true
      // },
      {
        name: 'fhName',
        label: 'F\'s Name',
        type: 'text',
        placeholder: 'e.g. MR. RAJESH SHARMA',
        required: true,
        maxLength: 20,
        uppercaseOnBlur: true
      },
      // {
      //   name: 'dob',
      //   label: 'Date of Birth',
      //   type: 'date',
      //   required: true
      // },
      // {
      //   name: 'session',
      //   label: 'Session',
      //   type: 'text',
      //   placeholder: 'e.g. 2025-2026',
      //   required: true,
      //   uppercaseOnBlur: true
      // },
      // {
      //   name: 'idNo',
      //   label: 'ID Number',
      //   type: 'text',
      //   placeholder: 'e.g. MPS/26/101',
      //   required: true,
      //   uppercaseOnBlur: true
      // },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: 'e.g. 9876543210',
        required: true,
        pattern: '^\\d{10}$'
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text',
        placeholder: 'e.g. Suhagi, Jabalpur M.P.',
        required: true,
        maxLength: 50,
        uppercaseOnBlur: true
      }
    ]
  },
  'igs-card': {
    id: 'igs-card',
    title: 'Integrated Govt. High School Atariya',
    orientation: 'portrait',
    layoutType: 'portrait-igs',
    dbTable: 'igs-cards',
    storageBucket: 'igs-cards',
    isSecondaryClient: true,
    enableDbUploadFlag: 'ENABLE_DB_UPLOAD_CARD3',
    enableLocalDownloadFlag: 'ENABLE_LOCAL_DOWNLOAD_CARD3',
    theme: {
      cardBgSvg: '/igs.svg'
    },
    fields: [
      {
        name: 'studentName',
        label: 'Name of the Student',
        type: 'text',
        placeholder: 'e.g. RAHUL SHARMA',
        required: true,
        minLength: 3,
        uppercaseOnBlur: true
      },
      {
        name: 'class',
        label: 'Class',
        type: 'select',
        defaultValue: 'LKG',
        options: ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        required: true
      },
      {
        name: 'section',
        label: 'Section',
        type: 'text',
        placeholder: 'e.g. A',
        uppercaseOnBlur: true
      },
      {
        name: 'fhName',
        label: 'Father\'s Name',
        type: 'text',
        placeholder: 'e.g. MR. RAJESH SHARMA',
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        name: 'session',
        label: 'Session',
        type: 'text',
        defaultValue: '2026-2027',
        readonly: true,
        required: true,
        uppercaseOnBlur: true
      },
      {
        name: 'idNo',
        label: 'ID Number',
        type: 'text',
        placeholder: 'e.g. MPS/26/101',
        required: false,
        uppercaseOnBlur: true
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: 'e.g. 9876543210',
        required: true,
        pattern: '^\\d{10}$'
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text',
        placeholder: 'e.g. Suhagi, Jabalpur M.P.',
        required: true,
        uppercaseOnBlur: true
      }
    ]
  },
};
