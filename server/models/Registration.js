const mongoose = require('mongoose');

const VALID_EVENTS = [
  'Paper Presentation',
  'Connectify',
  'Bot Marathon',
  'Sustainable Concept Pitch',
  'Mindbender',
  'Bug Busters',
  'Code Clash in Embedded C',
  'Fun Zone',
];

// Generate registration ID: MIT- + 6 random uppercase alphanumeric chars
function generateRegistrationId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MIT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const registrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    registrationId: {
      type: String,
      unique: true,
      default: generateRegistrationId,
    },
    events: {
      type: [String],
      required: [true, 'At least one event is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.every((e) => VALID_EVENTS.includes(e));
        },
        message: 'At least one valid event is required. Choose from: ' + VALID_EVENTS.join(', '),
      },
    },
    amount: {
      type: Number,
      required: true,
      default: 200,
    },
    teamLeader: {
      name: {
        type: String,
        required: [true, 'Team leader name is required'],
        trim: true,
      },
      college: {
        type: String,
        required: [true, 'Team leader college is required'],
        trim: true,
      },
      degree: {
        type: String,
        required: [true, 'Team leader degree is required'],
        trim: true,
      },
      department: {
        type: String,
        required: [true, 'Team leader department is required'],
        trim: true,
      },
      year: {
        type: String,
        enum: {
          values: ['1st', '2nd', '3rd', '4th', '1st Year', '2nd Year', '3rd Year', '4th Year'],
          message: 'Year must be 1st, 2nd, 3rd, or 4th',
        },
        required: [true, 'Team leader year of study is required'],
      },
      email: {
        type: String,
        required: [true, 'Team leader email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      },
      phone: {
        type: String,
        required: [true, 'Team leader phone number is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
      },
    },
    teamMembers: [
      {
        name: {
          type: String,
          required: [true, 'Team member name is required'],
          trim: true,
        },
        college: {
          type: String,
          required: [true, 'Team member college is required'],
          trim: true,
        },
        degree: {
          type: String,
          required: [true, 'Team member degree is required'],
          trim: true,
        },
        department: {
          type: String,
          required: [true, 'Team member department is required'],
          trim: true,
        },
        year: {
          type: String,
          enum: {
            values: ['1st', '2nd', '3rd', '4th', '1st Year', '2nd Year', '3rd Year', '4th Year'],
            message: 'Year must be 1st, 2nd, 3rd, or 4th',
          },
          required: [true, 'Team member year of study is required'],
        },
        email: {
          type: String,
          required: [true, 'Team member email is required'],
          trim: true,
          lowercase: true,
          match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        phone: {
          type: String,
          required: [true, 'Team member phone number is required'],
          trim: true,
          match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
        },
      },
    ],

  },
  {
    timestamps: true,
  }
);

// Ensure unique registrationId on retry if collision occurs
registrationSchema.pre('save', async function () {
  if (this.isNew && !this.registrationId) {
    let isUnique = false;
    while (!isUnique) {
      const id = generateRegistrationId();
      const existing = await mongoose.model('Registration').findOne({ registrationId: id });
      if (!existing) {
        this.registrationId = id;
        isUnique = true;
      }
    }
  }
});

registrationSchema.statics.VALID_EVENTS = VALID_EVENTS;

module.exports = mongoose.model('Registration', registrationSchema);
