import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  userId: string;
  tranId: string;
  sessionKey?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  sslcommerzResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  tranId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionKey: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  sslcommerzResponse: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
PaymentSchema.index({ orderId: 1, userId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ tranId: 1 }, { unique: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema); 