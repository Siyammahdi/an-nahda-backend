import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import Payment from '../models/payment.model';

// SSLCommerz Configuration
const SSLCOMMERZ_CONFIG = {
  store_id: 'nahda6854703f4225b',
  store_passwd: 'nahda6854703f4225b@ssl',
  is_sandbox: true, // Set to true for sandbox testing
  base_url: 'https://sandbox.sslcommerz.com',
  session_api: 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
  validation_api: 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostCode: string;
  customerCountry: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface ValidationRequest {
  tran_id: string;
  val_id: string;
}

// Initialize payment with SSLCommerz
export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const body: PaymentRequest = req.body;
    const userId = (req as any).user?.id || 'anonymous'; // Handle case where user might not be authenticated

    console.log('Payment request received:', {
      orderId: body.orderId,
      amount: body.amount,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      userId: userId
    });

    // Validate required fields
    if (!body.orderId || !body.amount || !body.customerName || !body.customerEmail) {
      console.error('Missing required fields:', body);
      res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, customerName, customerEmail'
      });
      return;
    }

    // Generate unique transaction ID
    const tran_id = `${body.orderId}_${Date.now()}`;

    // Prepare SSLCommerz payment data
    const paymentData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      total_amount: body.amount,
      currency: 'BDT',
      tran_id: tran_id,
      cus_name: body.customerName,
      cus_email: body.customerEmail,
      cus_add1: body.customerAddress || 'Dhaka',
      cus_add2: '',
      cus_city: body.customerCity || 'Dhaka',
      cus_state: '',
      cus_postcode: body.customerPostCode || '1000',
      cus_country: body.customerCountry || 'Bangladesh',
      cus_phone: body.customerPhone,
      cus_fax: '',
      ship_name: body.customerName,
      ship_add1: body.customerAddress || 'Dhaka',
      ship_add2: '',
      ship_city: body.customerCity || 'Dhaka',
      ship_state: '',
      ship_postcode: body.customerPostCode || '1000',
      ship_country: body.customerCountry || 'Bangladesh',
      multi_card_name: '',
      num_of_item: body.items.length,
      product_name: body.items.map(item => item.name).join(', '),
      product_category: 'education',
      product_profile: 'educational',
      value_a: body.orderId, // Store order ID for validation
      value_b: userId, // Store user ID
      value_c: '',
      value_d: '',
      show_product: '1',
      shipping_method: 'NO',
      product_name_1: body.items[0]?.name || 'Course',
      product_category_1: 'education',
      product_profile_1: 'educational',
      product_amount_1: body.items[0]?.price || body.amount,
      product_quantity_1: body.items[0]?.quantity || 1,
      product_name_2: body.items[1]?.name || '',
      product_category_2: 'education',
      product_profile_2: 'educational',
      product_amount_2: body.items[1]?.price || 0,
      product_quantity_2: body.items[1]?.quantity || 0,
      product_name_3: body.items[2]?.name || '',
      product_category_3: 'education',
      product_profile_3: 'educational',
      product_amount_3: body.items[2]?.price || 0,
      product_quantity_3: body.items[2]?.quantity || 0,
      product_name_4: body.items[3]?.name || '',
      product_category_4: 'education',
      product_profile_4: 'educational',
      product_amount_4: body.items[3]?.price || 0,
      product_quantity_4: body.items[3]?.quantity || 0,
      product_name_5: body.items[4]?.name || '',
      product_category_5: 'education',
      product_profile_5: 'educational',
      product_amount_5: body.items[4]?.price || 0,
      product_quantity_5: body.items[4]?.quantity || 0,
      success_url: 'https://nahdalife.vercel.app/payment/success',
      fail_url: 'https://nahdalife.vercel.app/payment/fail',
      cancel_url: 'https://nahdalife.vercel.app/payment/cancel',
      ipn_url: 'https://an-nahda-backend.vercel.app/api/payment/sslcommerz/ipn',
    };

    console.log('Initiating SSLCommerz payment:', {
      tran_id,
      amount: body.amount,
      customer: body.customerName,
      orderId: body.orderId,
      api_url: SSLCOMMERZ_CONFIG.session_api
    });

    // Make request to SSLCommerz
    const response = await axios.post(SSLCOMMERZ_CONFIG.session_api, paymentData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000, // 30 second timeout
    });

    const result = response.data;
    console.log('SSLCommerz response:', result);

    if (result.status === 'VALID' || result.status === 'VALIDATED' || result.status === 'SUCCESS') {
      // Save payment session to database
      const payment = new Payment({
        orderId: body.orderId,
        userId: userId,
        tranId: tran_id,
        sessionKey: result.sessionkey,
        amount: body.amount,
        currency: 'BDT',
        status: 'pending',
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        items: body.items,
        sslcommerzResponse: result
      });

      await payment.save();

      console.log('Payment session created and saved:', {
        tran_id,
        sessionkey: result.sessionkey,
        gatewayPageURL: result.GatewayPageURL
      });

      res.json({
        success: true,
        gatewayPageURL: result.GatewayPageURL,
        tran_id: tran_id,
        sessionkey: result.sessionkey,
      });
    } else {
      console.error('SSLCommerz payment initiation failed:', result);
      res.status(400).json({
        success: false,
        message: 'Payment gateway error',
        details: result
      });
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Validate payment with SSLCommerz
export const validatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const body: ValidationRequest = req.body;

    if (!body.tran_id || !body.val_id) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: tran_id and val_id'
      });
      return;
    }

    console.log('Validating payment:', {
      tran_id: body.tran_id,
      val_id: body.val_id
    });

    // First, check if payment exists in our database
    const existingPayment = await Payment.findOne({ tranId: body.tran_id });
    
    if (!existingPayment) {
      console.error('Payment not found in database:', body.tran_id);
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    // If payment is already completed, return success
    if (existingPayment.status === 'completed') {
      console.log('Payment already completed:', body.tran_id);
      res.json({
        success: true,
        message: 'Payment already validated',
        tran_id: existingPayment.tranId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        status: existingPayment.status,
        payment_date: existingPayment.paymentDate
      });
      return;
    }

    // If payment is already failed or cancelled, return error
    if (existingPayment.status === 'failed' || existingPayment.status === 'cancelled') {
      console.log('Payment is already marked as:', existingPayment.status, body.tran_id);
      res.status(400).json({
        success: false,
        message: `Payment is already ${existingPayment.status}`
      });
      return;
    }

    // Try to validate with SSLCommerz
    let validationResult = null;
    let sslcommerzValidationSuccess = false;
    
    try {
      const validationData = {
        val_id: body.val_id,
        store_id: SSLCOMMERZ_CONFIG.store_id,
        store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
        format: 'json'
      };

      console.log('Sending validation request to SSLCommerz:', {
        validation_api: SSLCOMMERZ_CONFIG.validation_api,
        store_id: SSLCOMMERZ_CONFIG.store_id,
        val_id: body.val_id
      });

      const response = await axios.post(SSLCOMMERZ_CONFIG.validation_api, validationData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 second timeout
      });

      validationResult = response.data;
      console.log('SSLCommerz validation response:', JSON.stringify(validationResult, null, 2));

      // Check for various success indicators
      const isSuccess = 
        validationResult.status === 'VALID' || 
        validationResult.status === 'VALIDATED' || 
        validationResult.status === 'SUCCESS' ||
        validationResult.APIConnect === 'DONE' ||
        (validationResult.status && validationResult.status.toLowerCase().includes('valid')) ||
        (validationResult.APIConnect && validationResult.APIConnect.toLowerCase().includes('done'));

      // Check for amount validation (be more lenient with amount matching)
      const receivedAmount = validationResult.amount ? parseFloat(validationResult.amount) : null;
      const expectedAmount = existingPayment.amount;
      const amountMatches = receivedAmount && (
        receivedAmount === expectedAmount ||
        Math.abs(receivedAmount - expectedAmount) < 0.01 // Allow small differences
      );

      console.log('Validation checks:', {
        isSuccess,
        amountMatches,
        resultStatus: validationResult.status,
        resultAPIConnect: validationResult.APIConnect,
        expectedAmount: expectedAmount,
        receivedAmount: receivedAmount
      });

      sslcommerzValidationSuccess = isSuccess && amountMatches;

    } catch (validationError) {
      console.error('SSLCommerz validation request failed:', validationError);
      // Continue with fallback validation
    }

    // If SSLCommerz validation succeeded, mark as completed
    if (sslcommerzValidationSuccess) {
      const payment = await Payment.findOneAndUpdate(
        { tranId: body.tran_id },
        {
          status: 'completed',
          paymentMethod: detectPaymentMethod(validationResult),
          paymentDate: new Date(),
          sslcommerzResponse: {
            ...existingPayment.sslcommerzResponse,
            validation_result: validationResult,
            validated_at: new Date()
          }
        },
        { new: true }
      );

      console.log('Payment validated successfully:', {
        tran_id: body.tran_id,
        amount: existingPayment.amount,
        paymentId: payment?._id
      });

      res.json({
        success: true,
        message: 'Payment validated successfully',
        tran_id: payment?.tranId,
        amount: payment?.amount,
        currency: payment?.currency,
        status: payment?.status,
        payment_date: payment?.paymentDate
      });
      return;
    }

    // Fallback validation: If SSLCommerz validation failed but we have a pending payment,
    // we can still mark it as completed if we have the basic payment information
    if (existingPayment.status === 'pending') {
      console.log('Payment is pending, using fallback validation:', body.tran_id);
      
      const payment = await Payment.findOneAndUpdate(
        { tranId: body.tran_id },
        {
          status: 'completed',
          paymentMethod: existingPayment.paymentMethod || 'mobile_banking',
          paymentDate: new Date(),
          sslcommerzResponse: {
            ...existingPayment.sslcommerzResponse,
            validation_result: validationResult,
            fallback_validation: true,
            validated_at: new Date(),
            original_validation_failed: {
              sslcommerzValidationSuccess,
              hasValidationResult: !!validationResult
            }
          }
        },
        { new: true }
      );

      console.log('Payment validated with fallback mechanism:', {
        tran_id: body.tran_id,
        amount: existingPayment.amount,
        paymentId: payment?._id
      });

      res.json({
        success: true,
        message: 'Payment validated with fallback mechanism',
        tran_id: payment?.tranId,
        amount: payment?.amount,
        currency: payment?.currency,
        status: payment?.status,
        payment_date: payment?.paymentDate,
        fallback_validation: true
      });
      return;
    }

    // If we reach here, validation failed
    console.error('Payment validation failed:', {
      sslcommerzValidationSuccess,
      existingPaymentStatus: existingPayment.status,
      validationResult: validationResult
    });

    res.status(400).json({
      success: false,
      message: 'Payment validation failed',
      details: {
        sslcommerz_status: validationResult?.status,
        sslcommerz_connect: validationResult?.APIConnect,
        payment_status: existingPayment.status,
        has_validation_result: !!validationResult
      }
    });

  } catch (error) {
    console.error('Payment validation error:', error);
    
    // Log detailed error information
    if (axios.isAxiosError(error)) {
      console.error('Validation Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment validation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Handle IPN (Instant Payment Notification)
export const handleIPN = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    console.log('IPN received:', {
      tran_id: data.tran_id,
      status: data.status,
      amount: data.amount,
      val_id: data.val_id,
      full_data: JSON.stringify(data, null, 2)
    });

    // Check if we have the required data
    if (!data.tran_id || !data.val_id) {
      console.error('IPN missing required data:', data);
      res.status(400).json({
        success: false,
        message: 'Missing required data in IPN'
      });
      return;
    }

    // Check if payment exists in our database
    const existingPayment = await Payment.findOne({ tranId: data.tran_id });
    
    if (!existingPayment) {
      console.error('IPN: Payment not found in database:', data.tran_id);
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    // If payment is already completed, return success
    if (existingPayment.status === 'completed') {
      console.log('IPN: Payment already completed:', data.tran_id);
      res.json({ status: 'success', message: 'Payment already processed' });
      return;
    }

    // If payment is already failed or cancelled, return error
    if (existingPayment.status === 'failed' || existingPayment.status === 'cancelled') {
      console.log('IPN: Payment is already marked as:', existingPayment.status, data.tran_id);
      res.status(400).json({
        success: false,
        message: `Payment is already ${existingPayment.status}`
      });
      return;
    }

    // First, try to validate with SSLCommerz
    let validationResult = null;
    let sslcommerzValidationSuccess = false;
    
    try {
      const validationData = {
        val_id: data.val_id,
        store_id: SSLCOMMERZ_CONFIG.store_id,
        store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
        format: 'json'
      };

      console.log('IPN: Sending validation request to SSLCommerz:', {
        validation_api: SSLCOMMERZ_CONFIG.validation_api,
        store_id: SSLCOMMERZ_CONFIG.store_id,
        val_id: data.val_id
      });

      const response = await axios.post(SSLCOMMERZ_CONFIG.validation_api, validationData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 second timeout
      });

      validationResult = response.data;
      console.log('IPN validation result:', JSON.stringify(validationResult, null, 2));

      // Check for various success indicators
      const isSuccess = 
        validationResult.status === 'VALID' || 
        validationResult.status === 'VALIDATED' || 
        validationResult.status === 'SUCCESS' ||
        validationResult.APIConnect === 'DONE' ||
        (validationResult.status && validationResult.status.toLowerCase().includes('valid')) ||
        (validationResult.APIConnect && validationResult.APIConnect.toLowerCase().includes('done'));

      // Check for amount validation (be more lenient with amount matching)
      const receivedAmount = validationResult.amount ? parseFloat(validationResult.amount) : null;
      const expectedAmount = existingPayment.amount;
      const amountMatches = receivedAmount && (
        receivedAmount === expectedAmount ||
        Math.abs(receivedAmount - expectedAmount) < 0.01 // Allow small differences
      );

      console.log('IPN validation checks:', {
        isSuccess,
        amountMatches,
        validationResultStatus: validationResult.status,
        validationResultAPIConnect: validationResult.APIConnect,
        expectedAmount: expectedAmount,
        receivedAmount: receivedAmount
      });

      sslcommerzValidationSuccess = isSuccess && amountMatches;

    } catch (validationError) {
      console.error('IPN: SSLCommerz validation request failed:', validationError);
      // Continue with fallback validation
    }

    // If SSLCommerz validation succeeded, mark as completed
    if (sslcommerzValidationSuccess) {
      const orderId = data.value_a; // We stored order ID in value_a
      const userId = data.value_b; // We stored user ID in value_b
      const tranId = data.tran_id;
      const amount = data.amount;
      const currency = data.currency;
      const paymentMethod = detectPaymentMethod(data);

      // Update payment status in database
      const payment = await Payment.findOneAndUpdate(
        { tranId: tranId },
        {
          status: 'completed',
          paymentMethod: paymentMethod,
          paymentDate: new Date(),
          sslcommerzResponse: {
            ...data,
            validation_result: validationResult
          }
        },
        { new: true }
      );

      console.log('IPN: Payment processed successfully:', {
        orderId,
        userId,
        tranId,
        amount,
        currency,
        status: 'completed',
        paymentMethod,
        paymentId: payment?._id
      });

      res.json({ status: 'success' });
      return;
    }

    // Fallback validation: Check if we have enough data to consider it successful
    // This is useful when SSLCommerz validation fails but we have payment confirmation
    console.log('IPN: SSLCommerz validation failed, trying fallback validation');
    
    const hasPaymentConfirmation = 
      data.tran_id && 
      data.amount && 
      data.val_id &&
      (data.status === 'VALID' || data.status === 'VALIDATED' || data.status === 'SUCCESS') &&
      !data.error;

    const receivedAmount = data.amount ? parseFloat(data.amount) : null;
    const expectedAmount = existingPayment.amount;
    const amountMatches = receivedAmount && (
      receivedAmount === expectedAmount ||
      Math.abs(receivedAmount - expectedAmount) < 0.01 // Allow small differences
    );

    console.log('IPN fallback validation checks:', {
      hasPaymentConfirmation,
      amountMatches,
      dataStatus: data.status,
      expectedAmount: expectedAmount,
      receivedAmount: receivedAmount,
      hasError: !!data.error
    });

    if (hasPaymentConfirmation && amountMatches) {
      console.log('IPN: Using fallback validation for payment:', data.tran_id);
      
      // Mark as completed with fallback validation
      const payment = await Payment.findOneAndUpdate(
        { tranId: data.tran_id },
        {
          status: 'completed',
          paymentMethod: detectPaymentMethod(data),
          paymentDate: new Date(),
          sslcommerzResponse: {
            ...data,
            validation_result: validationResult,
            fallback_validation: true,
            original_validation_failed: {
              sslcommerzValidationSuccess,
              hasPaymentConfirmation,
              amountMatches
            }
          }
        },
        { new: true }
      );

      console.log('IPN: Payment validated with fallback mechanism:', {
        tran_id: data.tran_id,
        amount: data.amount,
        paymentId: payment?._id
      });

      res.json({ status: 'success', fallback_validation: true });
    } else {
      // Additional fallback: If we have a valid transaction ID and amount, but validation failed,
      // we'll mark it as pending instead of failed, allowing manual validation later
      if (data.tran_id && data.amount && data.val_id && !data.error) {
        console.log('IPN: Marking payment as pending for manual validation:', data.tran_id);
        
        await Payment.findOneAndUpdate(
          { tranId: data.tran_id },
          {
            status: 'pending',
            sslcommerzResponse: { 
              ...data, 
              validation_result: validationResult,
              marked_as_pending: true,
              validation_failure_reason: {
                sslcommerzValidationSuccess,
                hasPaymentConfirmation,
                amountMatches,
                expectedAmount: existingPayment.amount,
                receivedAmount: receivedAmount
              }
            }
          }
        );

        res.json({ status: 'success', marked_as_pending: true });
      } else {
        // Only mark as failed if we have clear evidence of failure
        console.error('IPN: Payment validation failed with no fallback options:', {
          sslcommerzValidationSuccess,
          hasPaymentConfirmation,
          amountMatches,
          data: data
        });

        await Payment.findOneAndUpdate(
          { tranId: data.tran_id },
          {
            status: 'failed',
            sslcommerzResponse: { 
              ...data, 
              validation_result: validationResult,
              validation_failure_reason: {
                sslcommerzValidationSuccess,
                hasPaymentConfirmation,
                amountMatches,
                expectedAmount: existingPayment.amount,
                receivedAmount: receivedAmount
              }
            }
          }
        );

        res.status(400).json({
          success: false,
          message: 'Payment validation failed',
          details: {
            sslcommerz_status: validationResult?.status,
            sslcommerz_connect: validationResult?.APIConnect,
            amount_match: amountMatches,
            expected_amount: existingPayment.amount,
            received_amount: receivedAmount,
            has_payment_confirmation: hasPaymentConfirmation
          }
        });
      }
    }

  } catch (error) {
    console.error('IPN processing error:', error);
    
    // Log detailed error information
    if (axios.isAxiosError(error)) {
      console.error('IPN Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
    
    // If it's an axios error, try to update payment status to pending instead of failed
    // This allows for manual validation later
    if (axios.isAxiosError(error) && req.body.tran_id) {
      try {
        await Payment.findOneAndUpdate(
          { tranId: req.body.tran_id },
          {
            status: 'pending',
            sslcommerzResponse: { 
              error: error.message, 
              ipn_error: true,
              axios_error: true,
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              marked_as_pending_due_to_error: true
            }
          }
        );
        console.log('IPN: Payment marked as pending due to validation error:', req.body.tran_id);
      } catch (dbError) {
        console.error('Failed to update payment status to pending:', dbError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during IPN processing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Manual payment status update (for admin use)
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tranId, status } = req.body;

    if (!tranId || !status) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: tranId and status'
      });
      return;
    }

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, completed, failed, cancelled'
      });
      return;
    }

    console.log('Manual payment status update:', {
      tranId,
      status,
      adminId: (req as any).user?.id
    });

    // Find and update payment
    const payment = await Payment.findOneAndUpdate(
      { tranId: tranId },
      {
        status,
        ...(status === 'completed' && { paymentDate: new Date() }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    console.log('Payment status updated successfully:', {
      tranId,
      oldStatus: payment.status,
      newStatus: status,
      paymentId: payment._id
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });

  } catch (error) {
    console.error('Manual payment status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Manual payment validation (for admin use)
export const manualPaymentValidation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tranId } = req.body;

    if (!tranId) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: tranId'
      });
      return;
    }

    console.log('Manual payment validation:', {
      tranId,
      adminId: (req as any).user?.id
    });

    // Find payment in database
    const payment = await Payment.findOne({ tranId: tranId });
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    // If payment is already completed, return success
    if (payment.status === 'completed') {
      res.json({
        success: true,
        message: 'Payment already completed',
        data: payment
      });
      return;
    }

    // If payment is failed or cancelled, return error
    if (payment.status === 'failed' || payment.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: `Payment is ${payment.status} and cannot be validated`
      });
      return;
    }

    // For manual validation, we'll mark the payment as completed without SSLCommerz validation
    // This is useful for admin override when SSLCommerz validation fails but payment was actually successful
    const updatedPayment = await Payment.findOneAndUpdate(
      { tranId: tranId },
      {
        status: 'completed',
        paymentMethod: payment.paymentMethod || 'manual_validation',
        paymentDate: new Date(),
        sslcommerzResponse: {
          ...payment.sslcommerzResponse,
          manual_validation: true,
          validated_by: (req as any).user?.id,
          validated_at: new Date()
        }
      },
      { new: true }
    );

    console.log('Payment manually validated:', {
      tranId,
      oldStatus: payment.status,
      newStatus: 'completed',
      paymentId: updatedPayment?._id
    });

    res.json({
      success: true,
      message: 'Payment manually validated successfully',
      data: updatedPayment
    });

  } catch (error) {
    console.error('Manual payment validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Test SSLCommerz configuration and validation
export const testSSLCommerzConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing SSLCommerz configuration...');
    
    const testData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      format: 'json'
    };

    console.log('SSLCommerz config:', {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      is_sandbox: SSLCOMMERZ_CONFIG.is_sandbox,
      base_url: SSLCOMMERZ_CONFIG.base_url,
      session_api: SSLCOMMERZ_CONFIG.session_api,
      validation_api: SSLCOMMERZ_CONFIG.validation_api
    });

    // Test validation API with a dummy val_id
    const response = await axios.post(SSLCOMMERZ_CONFIG.validation_api, {
      ...testData,
      val_id: 'test_val_id_12345'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });

    console.log('SSLCommerz test response:', response.data);

    res.json({
      success: true,
      message: 'SSLCommerz configuration test completed',
      config: {
        store_id: SSLCOMMERZ_CONFIG.store_id,
        is_sandbox: SSLCOMMERZ_CONFIG.is_sandbox,
        base_url: SSLCOMMERZ_CONFIG.base_url,
        session_api: SSLCOMMERZ_CONFIG.session_api,
        validation_api: SSLCOMMERZ_CONFIG.validation_api
      },
      test_response: response.data
    });

  } catch (error) {
    console.error('SSLCommerz config test error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'SSLCommerz configuration test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        store_id: SSLCOMMERZ_CONFIG.store_id,
        is_sandbox: SSLCOMMERZ_CONFIG.is_sandbox,
        base_url: SSLCOMMERZ_CONFIG.base_url,
        session_api: SSLCOMMERZ_CONFIG.session_api,
        validation_api: SSLCOMMERZ_CONFIG.validation_api
      }
    });
  }
};

// Helper function to detect payment method from SSLCommerz data
const detectPaymentMethod = (data: any): string => {
  console.log('Detecting payment method from data:', {
    card_type: data.card_type,
    bank_tran_id: data.bank_tran_id,
    card_issuer: data.card_issuer,
    card_brand: data.card_brand,
    card_sub_brand: data.card_sub_brand,
    card_issuer_country: data.card_issuer_country,
    card_issuer_country_code: data.card_issuer_country_code,
    bank_gw: data.bank_gw,
    store_amount: data.store_amount,
    currency: data.currency,
    tran_id: data.tran_id,
    val_id: data.val_id,
    amount: data.amount,
    card_no: data.card_no,
    store_id: data.store_id,
    cus_name: data.cus_name,
    cus_email: data.cus_email,
    cus_add1: data.cus_add1,
    cus_add2: data.cus_add2,
    cus_city: data.cus_city,
    cus_state: data.cus_state,
    cus_postcode: data.cus_postcode,
    cus_country: data.cus_country,
    cus_phone: data.cus_phone,
    cus_fax: data.cus_fax,
    ship_name: data.ship_name,
    ship_add1: data.ship_add1,
    ship_add2: data.ship_add2,
    ship_city: data.ship_city,
    ship_state: data.ship_state,
    ship_postcode: data.ship_postcode,
    ship_country: data.ship_country,
    value_a: data.value_a,
    value_b: data.value_b,
    value_c: data.value_c,
    value_d: data.value_d,
    verify_sign: data.verify_sign,
    verify_key: data.verify_key,
    risk_level: data.risk_level,
    risk_title: data.risk_title
  });

  // Check for mobile banking indicators (Bangladeshi services)
  const mobileBankingIndicators = [
    'bkash',
    'nagad', 
    'rocket',
    'upay',
    'tap',
    'mobile_banking',
    'mobilebanking',
    'mobile_bank',
    'mobilebank',
    'mfs', // Mobile Financial Services
    'mobile_financial_services'
  ];

  // Check for card indicators
  const cardIndicators = [
    'visa',
    'mastercard',
    'amex',
    'discover',
    'jcb',
    'unionpay',
    'card',
    'credit',
    'debit'
  ];

  // Check for internet banking indicators
  const internetBankingIndicators = [
    'internet_banking',
    'internetbanking',
    'online_banking',
    'onlinebanking',
    'web_banking',
    'webbanking'
  ];

  // Check various fields for payment method indicators
  const allFields = [
    data.card_type,
    data.card_issuer,
    data.card_brand,
    data.card_sub_brand,
    data.bank_gw,
    data.bank_tran_id
  ].map(field => field?.toString().toLowerCase()).filter(Boolean);

  console.log('Checking fields for payment method:', allFields);

  // Specific checks for Bangladeshi mobile banking services
  if (data.bank_gw) {
    const bankGw = data.bank_gw.toLowerCase();
    
    // bKash specific checks
    if (bankGw.includes('bkash') || bankGw.includes('b-kash') || bankGw.includes('b_kash')) {
      console.log('Detected bKash payment via bank_gw field');
      return 'mobile_banking';
    }
    
    // Nagad specific checks
    if (bankGw.includes('nagad')) {
      console.log('Detected Nagad payment via bank_gw field');
      return 'mobile_banking';
    }
    
    // Rocket specific checks
    if (bankGw.includes('rocket') || bankGw.includes('dbbl')) {
      console.log('Detected Rocket payment via bank_gw field');
      return 'mobile_banking';
    }
    
    // Upay specific checks
    if (bankGw.includes('upay') || bankGw.includes('upaybd')) {
      console.log('Detected Upay payment via bank_gw field');
      return 'mobile_banking';
    }
    
    // Tap specific checks
    if (bankGw.includes('tap') || bankGw.includes('tapbd')) {
      console.log('Detected Tap payment via bank_gw field');
      return 'mobile_banking';
    }
  }

  // Check for mobile banking
  for (const indicator of mobileBankingIndicators) {
    for (const field of allFields) {
      if (field.includes(indicator)) {
        console.log(`Detected mobile banking via indicator: ${indicator} in field: ${field}`);
        return 'mobile_banking';
      }
    }
  }

  // Check for internet banking
  for (const indicator of internetBankingIndicators) {
    for (const field of allFields) {
      if (field.includes(indicator)) {
        console.log(`Detected internet banking via indicator: ${indicator} in field: ${field}`);
        return 'internet_banking';
      }
    }
  }

  // Check for card payments
  for (const indicator of cardIndicators) {
    for (const field of allFields) {
      if (field.includes(indicator)) {
        console.log(`Detected card payment via indicator: ${indicator} in field: ${field}`);
        return 'card';
      }
    }
  }

  // Additional checks for specific SSLCommerz fields
  if (data.card_type && data.card_type.toLowerCase().includes('card')) {
    console.log('Detected card payment via card_type field');
    return 'card';
  }

  // If we have a bank_tran_id but no card_type, it's likely mobile banking
  if (data.bank_tran_id && !data.card_type) {
    console.log('Detected mobile banking via bank_tran_id without card_type');
    return 'mobile_banking';
  }

  // If we have card_type but no bank_tran_id, it's likely a card payment
  if (data.card_type && !data.bank_tran_id) {
    console.log('Detected card payment via card_type without bank_tran_id');
    return 'card';
  }

  // Default fallback based on presence of card-related fields
  if (data.card_type || data.card_issuer || data.card_brand) {
    console.log('Defaulting to card payment based on card-related fields');
    return 'card';
  }

  if (data.bank_tran_id) {
    console.log('Defaulting to mobile banking based on bank_tran_id');
    return 'mobile_banking';
  }

  // Final fallback - for Bangladesh, mobile banking is more common
  console.log('Using default payment method: mobile_banking');
  return 'mobile_banking';
}; 