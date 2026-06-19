import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import client from '../api/client';
import {
  Camera, X, Upload, CheckCircle, Loader2, FileUp,
  User, Phone, DollarSign, Briefcase, Image as ImageIcon,
  Edit2, Save, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle,
  FileText, Check, HelpCircle, UserCheck, Landmark, Plus, Info, Package
} from 'lucide-react';

const C = {
  primary: '#00A859',
  primaryDark: '#007A3F',
  primaryLight: '#E8F8EE',
  accent: '#FFB800',
  accentLight: '#FFF8E5',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  gray700: '#374151',
  gray600: '#4B5563',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
};

const CameraCapture = ({ onCapture, label, required = false, isLivePhoto = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isLivePhoto ? 'user' : 'environment' },
        audio: false
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (err) {
      toast.error('Could not access camera. Please check permissions.');
      console.error(err);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      setCapturedImage(blob);
      onCapture(blob);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapturedImage(file);
      onCapture(file);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ display: 'grid', gap: '0.5rem', width: '100%' }}>
      <div style={{ fontSize: '0.9rem', color: C.gray700, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label} {required && <span style={{ color: C.error }}>*</span>}
      </div>

      {isCameraActive ? (
        <div style={{
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          border: `1px solid ${C.gray200}`
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '280px',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 10
          }}>
            <button
              type="button"
              onClick={capturePhoto}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: C.primary,
                color: C.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,168,89,0.3)'
              }}
            >
              <Camera size={16} /> Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: C.error,
                color: C.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : capturedImage ? (
        <div style={{
          backgroundColor: C.gray50,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          border: `2px solid ${C.primary}`,
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: C.gray200, flexShrink: 0 }}>
            {capturedImage.type?.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Captured document"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.primaryLight }}>
                <FileText size={24} color={C.primary} />
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: C.gray700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {capturedImage.name || 'Captured Image.jpg'}
            </div>
            <div style={{ fontSize: '0.75rem', color: C.gray500 }}>
              {(capturedImage.size / 1024).toFixed(1)} KB · Ready to submit
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCapturedImage(null);
              onCapture(null);
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: C.errorLight,
              color: C.error,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={startCamera}
            style={{
              padding: '1rem 0.75rem',
              backgroundColor: C.primaryLight,
              color: C.primary,
              border: `1.5px dashed ${C.primary}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            <Camera size={18} />
            <span>Use Camera</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '1rem 0.75rem',
              backgroundColor: C.gray50,
              color: C.gray700,
              border: `1.5px dashed ${C.gray200}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            <Upload size={18} />
            <span>Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

const EligibilitySurveyFormPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personal: {
      surname: '',
      firstName: '',
      middleName: '',
      phoneNumber: '',
      phoneNumber2: '',
      email: '',
      residentialAddress: '',
      address2: '',
      nationality: 'Nigerian',
      stateOfOrigin: '',
      officeAddress: '',
      occupation: '',
      natureOfWork: '',
    },
    nok: {
      surname: '',
      firstName: '',
      middleName: '',
      phoneNumber: '',
      phoneNumber2: '',
      email: '',
      residentialAddress: '',
      address2: '',
      nationality: 'Nigerian',
      stateOfOrigin: '',
      officeAddress: '',
      occupation: '',
      relationship: '',
    },
    banking: {
      accountType: 'Saving',
      accountName: '',
      accountNumber: '',
      bankName: '',
      bvn: '',
      nin: '',
      drivingLicenseNo: '',
      drivingLicenseExpDate: '',
      votersCardVin: '',
    },
    funding: {
      sources: [],
      monthlyIncomeAmount: '',
      yearlyIncomeAmount: '',
    },
    additional: {
      expectedSourceOfIncome: '',
      changedAddressLast12Months: 'No',
      previousAddress: '',
      heardAboutLne: '',
      referralSourceAndContact: '',
    },
    declaration: {
      name: '',
      agreed: false,
    }
  });

  const [images, setImages] = useState({
    customer_live_photo: null,
    utility_bill_image: null,
    id_document_image: null,
    residence_permit_image: null,
    bank_statement_image: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [draftId, setDraftId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Product selector state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedInterestRate, setSelectedInterestRate] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');

  // Duration and interest options matching mobile app
  const DURATION_OPTIONS_50 = [3, 6, 12];
  const DURATION_OPTIONS_30 = [3, 6, 9, 12, 18];
  const INTEREST_OPTIONS_50 = { 3: 5, 6: 10, 12: 20 };
  const getDurationOptions = () => selectedPlanType === 'bnpl_50' ? DURATION_OPTIONS_50 : DURATION_OPTIONS_30;
  const getInterestForDuration = (months) => {
    if (selectedPlanType === 'bnpl_50') return INTEREST_OPTIONS_50[months] || 0;
    return 0; // 30% plan: bank determines interest
  };

  // Calculate deposit amount based on selected product and plan
  const getSelectedProduct = () => products.find(p => p.id === selectedProductId);
  const getDepositPercentage = () => {
    if (selectedPlanType === 'bnpl_50') return 50;
    if (selectedPlanType === 'bnpl_30_bank') return 30;
    return 0;
  };
  const calculatedDepositAmount = (() => {
    const product = getSelectedProduct();
    if (!product?.price || !getDepositPercentage()) return 0;
    return (parseFloat(product.price) * getDepositPercentage()) / 100;
  })();

  // Fetch solar products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await client('/products');
        setProducts(Array.isArray(data) ? data : (data.data || data.products || []));
      } catch (err) {
        console.error('Failed to load products:', err);
        toast.error('Could not load solar products. Please refresh.');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Pre-fill from draft if navigated from dashboard
  useEffect(() => {
    if (location.state?.draftData) {
      const app = location.state.draftData;
      setDraftId(app.id);
      if (app.product_id) {
        setSelectedProductId(app.product_id);
      }
      if (app.plan_type) {
        setSelectedPlanType(app.plan_type);
      }
      if (app.survey_data) {
        setFormData(prev => ({
          ...prev,
          ...app.survey_data
        }));
      }
    }
  }, [location.state]);

  // Sync declaration name with Surname + First Name
  useEffect(() => {
    const fullName = `${formData.personal.surname} ${formData.personal.firstName}`.trim();
    setFormData(prev => ({
      ...prev,
      declaration: {
        ...prev.declaration,
        name: fullName
      }
    }));
  }, [formData.personal.surname, formData.personal.firstName]);

  // Sync monthly income to yearly income
  useEffect(() => {
    const monthly = parseFloat(formData.funding.monthlyIncomeAmount);
    if (!isNaN(monthly)) {
      setFormData(prev => ({
        ...prev,
        funding: {
          ...prev.funding,
          yearlyIncomeAmount: (monthly * 12).toString()
        }
      }));
    }
  }, [formData.funding.monthlyIncomeAmount]);

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => {
      const currentSources = [...prev.funding.sources];
      if (checked) {
        if (!currentSources.includes(field)) currentSources.push(field);
      } else {
        const index = currentSources.indexOf(field);
        if (index > -1) currentSources.splice(index, 1);
      }
      return {
        ...prev,
        funding: {
          ...prev.funding,
          sources: currentSources
        }
      };
    });
  };

  const handleImageCapture = (imageType, blob) => {
    setImages(prev => ({
      ...prev,
      [imageType]: blob
    }));
  };

  // Validate fields for current step
  const validateStep = (step) => {
    if (step === 1) {
      if (!selectedProductId) {
        toast.error('Please select the solar product the customer is applying for');
        return false;
      }
      if (!selectedPlanType) {
        toast.error('Please select the BNPL plan type');
        return false;
      }
      if (!selectedDuration) {
        toast.error('Please select the loan duration');
        return false;
      }
      if (!paymentFrequency) {
        toast.error('Please select payment frequency');
        return false;
      }
      if (!images.customer_live_photo) {
        toast.error('Customer Live Photo Capture is required');
        return false;
      }
      const p = formData.personal;
      if (!p.surname.trim() || !p.firstName.trim() || !p.phoneNumber.trim() || !p.residentialAddress.trim() || !p.nationality.trim() || !p.stateOfOrigin.trim() || !p.occupation.trim() || !p.natureOfWork.trim()) {
        toast.error('Please fill in all required personal information fields');
        return false;
      }
    } else if (step === 2) {
      const n = formData.nok;
      if (!n.surname.trim() || !n.firstName.trim() || !n.phoneNumber.trim() || !n.residentialAddress.trim() || !n.relationship.trim()) {
        toast.error('Please fill in all required Next of Kin fields');
        return false;
      }
    } else if (step === 3) {
      const b = formData.banking;
      if (!b.accountName.trim() || !b.accountNumber.trim() || !b.bankName.trim() || !b.bvn.trim() || !b.nin.trim()) {
        toast.error('Please fill in all required banking details');
        return false;
      }
      if (b.bvn.trim().length !== 11) {
        toast.error('BVN must be exactly 11 digits');
        return false;
      }
      if (b.nin.trim().length !== 11) {
        toast.error('NIN must be exactly 11 digits');
        return false;
      }
      if (b.drivingLicenseNo.trim() && !b.drivingLicenseExpDate.trim()) {
        toast.error('Please provide the driving license expiration date');
        return false;
      }
    } else if (step === 4) {
      const f = formData.funding;
      const a = formData.additional;
      if (f.sources.length === 0) {
        toast.error('Please select at least one expected source of funds');
        return false;
      }
      if (!f.monthlyIncomeAmount.trim()) {
        toast.error('Please specify your monthly income amount');
        return false;
      }
      if (!a.expectedSourceOfIncome.trim()) {
        toast.error('Expected source of income description is required');
        return false;
      }
      if (a.changedAddressLast12Months === 'Yes' && !a.previousAddress.trim()) {
        toast.error('Please provide your previous house address');
        return false;
      }
    } else if (step === 5) {
      if (!images.id_document_image) {
        toast.error('ID Document upload is required');
        return false;
      }
      if (!images.utility_bill_image) {
        toast.error('Utility Bill upload is required');
        return false;
      }
      if (!formData.declaration.agreed) {
        toast.error('You must agree to the declaration statement');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(5)) return;

    const form = new FormData();
    // Set top-level fields for backend validations
    const fullName = `${formData.personal.surname} ${formData.personal.firstName} ${formData.personal.middleName}`.trim();
    form.append('customer_name', fullName);
    form.append('customer_email', formData.personal.email);
    form.append('customer_phone', formData.personal.phoneNumber);
    form.append('annual_income', formData.funding.yearlyIncomeAmount || (parseFloat(formData.funding.monthlyIncomeAmount) * 12).toString());
    form.append('employment_type', formData.personal.natureOfWork?.toLowerCase().includes('self') ? 'self_employed' : 'employed');
    if (selectedProductId) form.append('product_id', selectedProductId);
    if (selectedPlanType) form.append('plan_type', selectedPlanType);
    if (calculatedDepositAmount > 0) form.append('deposit_amount', calculatedDepositAmount);
    if (selectedDuration) form.append('duration_months', selectedDuration);
    if (selectedInterestRate || selectedInterestRate === 0) form.append('interest_rate', selectedInterestRate);
    if (paymentFrequency) form.append('payment_frequency', paymentFrequency);

    // Add full nested JSON payload
    form.append('survey_data', JSON.stringify(formData));

    // Upload files
    if (images.customer_live_photo) {
      form.append('customer_live_photo', images.customer_live_photo, images.customer_live_photo.name || 'customer_live_photo.jpg');
    }
    if (images.utility_bill_image) {
      form.append('utility_bill_image', images.utility_bill_image, images.utility_bill_image.name || 'utility_bill.jpg');
    }
    if (images.id_document_image) {
      form.append('id_document_image', images.id_document_image, images.id_document_image.name || 'id_document.jpg');
    }
    if (images.bank_statement_image) {
      form.append('bank_statement_image', images.bank_statement_image, images.bank_statement_image.name || 'bank_statement.jpg');
    }
    if (images.residence_permit_image) {
      form.append('residence_permit_image', images.residence_permit_image, images.residence_permit_image.name || 'residence_permit.jpg');
    }

    try {
      setSubmitting(true);
      const response = await client('/branch-manager/eligibility-survey', {
        method: 'POST',
        body: form
      });

      setApplicationId(response.application_id);
      setSubmitted(true);
      toast.success('Eligibility survey submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit survey');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const form = new FormData();
    if (draftId) {
      form.append('draft_id', draftId);
    }
    if (selectedProductId) form.append('product_id', selectedProductId);
    if (selectedPlanType) form.append('plan_type', selectedPlanType);
    if (calculatedDepositAmount > 0) form.append('deposit_amount', calculatedDepositAmount);
    if (selectedDuration) form.append('duration_months', selectedDuration);
    if (selectedInterestRate || selectedInterestRate === 0) form.append('interest_rate', selectedInterestRate);
    if (paymentFrequency) form.append('payment_frequency', paymentFrequency);
    form.append('survey_data', JSON.stringify(formData));

    if (images.customer_live_photo) {
      form.append('customer_live_photo', images.customer_live_photo, images.customer_live_photo.name || 'customer_live_photo.jpg');
    }
    if (images.utility_bill_image) {
      form.append('utility_bill_image', images.utility_bill_image, images.utility_bill_image.name || 'utility_bill.jpg');
    }
    if (images.id_document_image) {
      form.append('id_document_image', images.id_document_image, images.id_document_image.name || 'id_document.jpg');
    }
    if (images.bank_statement_image) {
      form.append('bank_statement_image', images.bank_statement_image, images.bank_statement_image.name || 'bank_statement.jpg');
    }
    if (images.residence_permit_image) {
      form.append('residence_permit_image', images.residence_permit_image, images.residence_permit_image.name || 'residence_permit.jpg');
    }

    try {
      setSavingDraft(true);
      const response = await client('/branch-manager/eligibility-survey/draft', {
        method: 'POST',
        body: form
      });
      setDraftId(response.application_id);
      toast.success('Application draft saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save draft');
      console.error(err);
    } finally {
      setSavingDraft(false);
    }
  };

  const stepsList = [
    { number: 1, title: 'Personal Info & Photo', icon: User },
    { number: 2, title: 'Next of Kin', icon: UserCheck },
    { number: 3, title: 'Banking Details', icon: Landmark },
    { number: 4, title: 'Income & Repayment', icon: DollarSign },
    { number: 5, title: 'KYC & Submit', icon: ShieldCheck }
  ];

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: '640px', margin: '3rem auto' }}>
          <div style={{
            backgroundColor: C.white,
            border: `1px solid ${C.gray200}`,
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: C.primaryLight,
              color: C.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: `2px solid ${C.primary}`
            }}>
              <Check size={40} strokeWidth={3} />
            </div>

            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: C.primaryDark,
              marginBottom: '1rem',
              letterSpacing: '-0.5px'
            }}>
              Application Submitted!
            </h2>

            <p style={{
              color: C.gray600,
              fontSize: '1rem',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              The walk-in customer eligibility survey has been successfully registered. The application has been created and is pending initial review.
            </p>

            <div style={{
              backgroundColor: C.gray50,
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              textAlign: 'left',
              border: `1px solid ${C.gray200}`
            }}>
              <div style={{ fontSize: '0.8rem', color: C.gray500, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                Application Ref ID
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: C.gray700,
                wordBreak: 'break-all'
              }}>
                #{applicationId}
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setApplicationId(null);
                setCurrentStep(1);
                setFormData({
                  personal: {
                    surname: '',
                    firstName: '',
                    middleName: '',
                    phoneNumber: '',
                    phoneNumber2: '',
                    email: '',
                    residentialAddress: '',
                    address2: '',
                    nationality: 'Nigerian',
                    stateOfOrigin: '',
                    officeAddress: '',
                    occupation: '',
                    natureOfWork: '',
                  },
                  nok: {
                    surname: '',
                    firstName: '',
                    middleName: '',
                    phoneNumber: '',
                    phoneNumber2: '',
                    email: '',
                    residentialAddress: '',
                    address2: '',
                    nationality: 'Nigerian',
                    stateOfOrigin: '',
                    officeAddress: '',
                    occupation: '',
                    relationship: '',
                  },
                  banking: {
                    accountType: 'Saving',
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    bvn: '',
                    nin: '',
                    drivingLicenseNo: '',
                    drivingLicenseExpDate: '',
                    votersCardVin: '',
                  },
                  funding: {
                    sources: [],
                    monthlyIncomeAmount: '',
                    yearlyIncomeAmount: '',
                  },
                  additional: {
                    expectedSourceOfIncome: '',
                    changedAddressLast12Months: 'No',
                    previousAddress: '',
                    heardAboutLne: '',
                    referralSourceAndContact: '',
                  },
                  declaration: {
                    name: '',
                    agreed: false,
                  }
                });
                setSelectedProductId('');
                setImages({
                  customer_live_photo: null,
                  utility_bill_image: null,
                  id_document_image: null,
                  residence_permit_image: null,
                  bank_statement_image: null,
                });
              }}
              style={{
                padding: '0.85rem 2.5rem',
                backgroundColor: C.primary,
                color: C.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                transition: 'background 0.2s'
              }}
            >
              Register Another Customer
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{
              backgroundColor: C.primaryLight,
              color: C.primaryDark,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Registration Source: Walk-in customer
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: C.gray700, margin: '8px 0 0', letterSpacing: '-0.5px' }}>
              Eligibility Survey Form
            </h1>
            <p style={{ color: C.gray500, marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Complete the multi-step KYC profile assessment for solar loan qualification.
            </p>
          </div>
        </div>

        {/* Stepper Header */}
        <div style={{
          backgroundColor: C.white,
          border: `1px solid ${C.gray200}`,
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {stepsList.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? C.primary : isCompleted ? C.primaryLight : C.gray100,
                    color: isActive ? C.white : isCompleted ? C.primary : C.gray500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    border: isActive ? `2px solid ${C.primary}` : `2px solid ${isCompleted ? C.primary : C.gray200}`,
                    transition: 'all 0.3s ease'
                  }}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
                  </div>
                  <div style={{ display: 'none', md: 'block' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: isActive || isCompleted ? '700' : '500',
                      color: isActive ? C.primary : isCompleted ? C.gray700 : C.gray400,
                      whiteSpace: 'nowrap'
                    }}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {idx < stepsList.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: isCompleted ? C.primary : C.gray200,
                    margin: '0 1rem',
                    transition: 'background-color 0.3s ease'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: C.white,
          border: `1px solid ${C.gray200}`,
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>

          {/* STEP 1: Live Photo & Personal Info */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Solar Product Selection */}
              <div style={{
                background: `linear-gradient(135deg, ${C.primaryLight} 0%, #d4f5e5 100%)`,
                border: `2px solid ${selectedProductId ? C.primary : C.gray200}`,
                borderRadius: '14px',
                padding: '1.5rem',
                transition: 'border-color 0.2s'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: C.primaryDark, margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={20} color={C.primary} /> Solar Product Selection <span style={{ color: C.error, fontWeight: '900' }}>*</span>
                </h3>
                <p style={{ color: C.gray600, margin: '0 0 1rem 0', fontSize: '0.85rem' }}>
                  Select the solar product the customer is applying for under BNPL.
                </p>

                {productsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: C.gray500, padding: '0.75rem 0' }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.9rem' }}>Loading products...</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: `2px solid ${selectedProductId ? C.primary : C.gray200}`,
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: selectedProductId ? C.gray700 : C.gray400,
                        backgroundColor: C.white,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">— Select a solar product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.price ? ` — ₦${Number(p.price).toLocaleString()}` : ''}
                        </option>
                      ))}
                    </select>

                    {selectedProductId && (() => {
                      const selected = products.find(p => p.id === selectedProductId);
                      return selected ? (
                        <div style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem 1rem',
                          backgroundColor: C.white,
                          borderRadius: '10px',
                          border: `1.5px solid ${C.primary}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: C.primaryLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Package size={18} color={C.primary} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: C.gray700 }}>{selected.name}</div>
                            {selected.price && (
                              <div style={{ fontSize: '0.8rem', color: C.primary, fontWeight: '600' }}>₦{Number(selected.price).toLocaleString()}</div>
                            )}
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <CheckCircle size={20} color={C.primary} />
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    <div style={{ marginTop: '1.25rem' }}>
                      <p style={{ color: C.gray600, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>
                        Select the BNPL payment plan for this product:
                      </p>
                      <select
                        value={selectedPlanType}
                        onChange={(e) => {
                          setSelectedPlanType(e.target.value);
                          setSelectedDuration('');
                          setSelectedInterestRate('');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          border: `2px solid ${selectedPlanType ? C.primary : C.gray200}`,
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: selectedPlanType ? C.gray700 : C.gray400,
                          backgroundColor: C.white,
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="">— Select a BNPL Plan —</option>
                        <option value="bnpl_50">50% Deposit Plan</option>
                        <option value="bnpl_30_bank">30% Bank Loan Plan</option>
                      </select>
                    </div>

                    {selectedProductId && selectedPlanType && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: C.white,
                        borderRadius: '10px',
                        border: `2px solid ${C.primary}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: C.gray500, fontWeight: '600' }}>Product Price</span>
                          <span style={{ fontSize: '0.95rem', color: C.gray700, fontWeight: '700' }}>
                            ₦{getSelectedProduct()?.price ? Number(getSelectedProduct().price).toLocaleString() : '—'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: C.gray500, fontWeight: '600' }}>Deposit Percentage</span>
                          <span style={{ fontSize: '0.95rem', color: C.primary, fontWeight: '700' }}>{getDepositPercentage()}%</span>
                        </div>
                        <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.95rem', color: C.gray700, fontWeight: '700' }}>Initial Payment (Deposit)</span>
                            <span style={{ fontSize: '1.1rem', color: C.primary, fontWeight: '800' }}>
                              ₦{calculatedDepositAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Payment Frequency ── */}
                    {selectedProductId && selectedPlanType && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: C.gray600, margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600' }}>
                          Payment Frequency:
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          {['monthly', 'weekly'].map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setPaymentFrequency(freq)}
                              style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: `2px solid ${paymentFrequency === freq ? C.primary : C.gray200}`,
                                borderRadius: '10px',
                                backgroundColor: paymentFrequency === freq ? C.primaryLight : C.white,
                                color: paymentFrequency === freq ? C.primary : C.gray500,
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                              }}
                            >
                              {freq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Duration (Months) ── */}
                    {selectedProductId && selectedPlanType && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: C.gray600, margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600' }}>
                          Loan Duration ({paymentFrequency === 'monthly' ? 'Months' : 'Weeks'}):
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {getDurationOptions().map((months) => {
                            const displayValue = paymentFrequency === 'monthly' ? months : Math.ceil(months * 4.33);
                            const displayUnit = paymentFrequency === 'monthly' ? 'mo' : 'wk';
                            return (
                              <button
                                key={months}
                                type="button"
                                onClick={() => {
                                  setSelectedDuration(months);
                                  setSelectedInterestRate(getInterestForDuration(months));
                                }}
                                style={{
                                  flex: '1 1 auto',
                                  minWidth: '80px',
                                  padding: '0.65rem 0.5rem',
                                  border: `2px solid ${selectedDuration === months ? C.primary : C.gray200}`,
                                  borderRadius: '10px',
                                  backgroundColor: selectedDuration === months ? C.primaryLight : C.white,
                                  color: selectedDuration === months ? C.primary : C.gray500,
                                  fontWeight: '700',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  textAlign: 'center'
                                }}
                              >
                                {displayValue} {displayUnit}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Interest Rate ── */}
                    {selectedProductId && selectedPlanType && selectedDuration && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: selectedPlanType === 'bnpl_50' ? '#FEF9E7' : '#E8F0FE',
                        borderRadius: '10px',
                        border: `1px solid ${selectedPlanType === 'bnpl_50' ? '#F59E0B' : '#3B82F6'}30`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: C.gray600, fontWeight: '600' }}>
                            {selectedPlanType === 'bnpl_50' ? 'Interest Rate' : 'Bank Interest'}
                          </span>
                          <span style={{
                            fontSize: '0.95rem',
                            fontWeight: '800',
                            color: selectedPlanType === 'bnpl_50' ? '#D97706' : '#2563EB'
                          }}>
                            {selectedPlanType === 'bnpl_50' ? `${selectedInterestRate}%` : 'TBD by Bank'}
                          </span>
                        </div>
                        {selectedPlanType === 'bnpl_50' && (
                          <p style={{ fontSize: '0.75rem', color: C.gray400, margin: '0.25rem 0 0' }}>
                            Interest charged on your 50% balance over {selectedDuration} months.
                          </p>
                        )}
                        {selectedPlanType === 'bnpl_30_bank' && (
                          <p style={{ fontSize: '0.75rem', color: C.gray400, margin: '0.25rem 0 0' }}>
                            Bank will confirm final interest rate after KYC verification.
                          </p>
                        )}
                      </div>
                    )}

                  </>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={22} color={C.primary} /> A. Customer Live Photo Capture
                </h3>
                <p style={{ color: C.gray500, margin: 0, fontSize: '0.85rem' }}>
                  Please capture a clear, real-time photograph of the customer.
                </p>
              </div>

              <div style={{ maxWidth: '400px', alignSelf: 'center', width: '100%', padding: '1rem', background: C.gray50, borderRadius: '12px', border: `1px solid ${C.gray200}` }}>
                <CameraCapture
                  label="Live Photo Capture"
                  required={true}
                  isLivePhoto={true}
                  onCapture={(blob) => handleImageCapture('customer_live_photo', blob)}
                />
              </div>

              <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={22} color={C.primary} /> B. Personal Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Surname *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nwosu"
                      value={formData.personal.surname}
                      onChange={(e) => handleNestedInputChange('personal', 'surname', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chinelo"
                      value={formData.personal.firstName}
                      onChange={(e) => handleNestedInputChange('personal', 'firstName', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Middle Name</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={formData.personal.middleName}
                      onChange={(e) => handleNestedInputChange('personal', 'middleName', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Phone Number 1 *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +234 803 123 4567"
                      value={formData.personal.phoneNumber}
                      onChange={(e) => handleNestedInputChange('personal', 'phoneNumber', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Phone Number 2</label>
                    <input
                      type="tel"
                      placeholder="Optional"
                      value={formData.personal.phoneNumber2}
                      onChange={(e) => handleNestedInputChange('personal', 'phoneNumber2', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={formData.personal.email}
                      onChange={(e) => handleNestedInputChange('personal', 'email', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Nationality *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nigerian"
                      value={formData.personal.nationality}
                      onChange={(e) => handleNestedInputChange('personal', 'nationality', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>State of Origin *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enugu State"
                      value={formData.personal.stateOfOrigin}
                      onChange={(e) => handleNestedInputChange('personal', 'stateOfOrigin', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Occupation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Business Owner / Civil Servant"
                      value={formData.personal.occupation}
                      onChange={(e) => handleNestedInputChange('personal', 'occupation', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Nature of Work *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Retail Trading / Ministry Office"
                      value={formData.personal.natureOfWork}
                      onChange={(e) => handleNestedInputChange('personal', 'natureOfWork', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 1' }}>
                    {/* Placeholder to align the full width addresses nicely */}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Residential Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House Number, Street Name, City, State"
                      value={formData.personal.residentialAddress}
                      onChange={(e) => handleNestedInputChange('personal', 'residentialAddress', e.target.value)}
                      style={styles.textarea}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Residential Address Line 2</label>
                    <input
                      type="text"
                      placeholder="Apartment, Suite, Unit, etc. (Optional)"
                      value={formData.personal.address2}
                      onChange={(e) => handleNestedInputChange('personal', 'address2', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Office Address</label>
                    <textarea
                      rows={2}
                      placeholder="Business or Office Building Address"
                      value={formData.personal.officeAddress}
                      onChange={(e) => handleNestedInputChange('personal', 'officeAddress', e.target.value)}
                      style={styles.textarea}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Next of Kin Details */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={22} color={C.primary} /> C. Next of Kin (NOK) Details
                </h3>
                <p style={{ color: C.gray500, margin: 0, fontSize: '0.85rem' }}>
                  Enter the contact and address details of the customer's designated next of kin.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Surname *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nwosu"
                    value={formData.nok.surname}
                    onChange={(e) => handleNestedInputChange('nok', 'surname', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinedu"
                    value={formData.nok.firstName}
                    onChange={(e) => handleNestedInputChange('nok', 'firstName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Middle Name</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formData.nok.middleName}
                    onChange={(e) => handleNestedInputChange('nok', 'middleName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Relationship *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse / Brother / Parent / Cousin"
                    value={formData.nok.relationship}
                    onChange={(e) => handleNestedInputChange('nok', 'relationship', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Phone Number 1 *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +234 809 999 8888"
                    value={formData.nok.phoneNumber}
                    onChange={(e) => handleNestedInputChange('nok', 'phoneNumber', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Phone Number 2</label>
                  <input
                    type="tel"
                    placeholder="Optional"
                    value={formData.nok.phoneNumber2}
                    onChange={(e) => handleNestedInputChange('nok', 'phoneNumber2', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. nok@example.com"
                    value={formData.nok.email}
                    onChange={(e) => handleNestedInputChange('nok', 'email', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Nationality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nigerian"
                    value={formData.nok.nationality}
                    onChange={(e) => handleNestedInputChange('nok', 'nationality', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>State of Origin *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enugu State"
                    value={formData.nok.stateOfOrigin}
                    onChange={(e) => handleNestedInputChange('nok', 'stateOfOrigin', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Occupation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Self-Employed / Engineer"
                    value={formData.nok.occupation}
                    onChange={(e) => handleNestedInputChange('nok', 'occupation', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Residential Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="NOK residential address"
                    value={formData.nok.residentialAddress}
                    onChange={(e) => handleNestedInputChange('nok', 'residentialAddress', e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Residential Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Apartment, Suite, Unit, etc. (Optional)"
                    value={formData.nok.address2}
                    onChange={(e) => handleNestedInputChange('nok', 'address2', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Office Address</label>
                  <textarea
                    rows={2}
                    placeholder="Office Address (Optional)"
                    value={formData.nok.officeAddress}
                    onChange={(e) => handleNestedInputChange('nok', 'officeAddress', e.target.value)}
                    style={styles.textarea}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Banking Details */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark size={22} color={C.primary} /> D. Banking Details
                </h3>
                <p style={{ color: C.gray500, margin: 0, fontSize: '0.85rem' }}>
                  Provide BVN, NIN, and verified bank account information for repayment evaluation.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Account Type *</label>
                  <select
                    value={formData.banking.accountType}
                    onChange={(e) => handleNestedInputChange('banking', 'accountType', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Saving">Saving</option>
                    <option value="Current">Current</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinelo Nwosu"
                    value={formData.banking.accountName}
                    onChange={(e) => handleNestedInputChange('banking', 'accountName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit NUBAN"
                    maxLength={10}
                    value={formData.banking.accountNumber}
                    onChange={(e) => handleNestedInputChange('banking', 'accountNumber', e.target.value.replace(/\D/g, ''))}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Access Bank / GTBank"
                    value={formData.banking.bankName}
                    onChange={(e) => handleNestedInputChange('banking', 'bankName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Bank Verification Number (BVN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="11-digit BVN"
                    maxLength={11}
                    value={formData.banking.bvn}
                    onChange={(e) => handleNestedInputChange('banking', 'bvn', e.target.value.replace(/\D/g, ''))}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>National Identity Number (NIN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="11-digit NIN"
                    maxLength={11}
                    value={formData.banking.nin}
                    onChange={(e) => handleNestedInputChange('banking', 'nin', e.target.value.replace(/\D/g, ''))}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Driving Licence Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AAA12345BB6 (Optional)"
                    value={formData.banking.drivingLicenseNo}
                    onChange={(e) => handleNestedInputChange('banking', 'drivingLicenseNo', e.target.value.toUpperCase())}
                    style={styles.input}
                  />
                </div>

                {formData.banking.drivingLicenseNo.trim() !== '' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Driving Licence Expiration Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.banking.drivingLicenseExpDate}
                      onChange={(e) => handleNestedInputChange('banking', 'drivingLicenseExpDate', e.target.value)}
                      style={styles.input}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Voters Card VIN</label>
                  <input
                    type="text"
                    placeholder="VIN Number (Optional)"
                    value={formData.banking.votersCardVin}
                    onChange={(e) => handleNestedInputChange('banking', 'votersCardVin', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Income, Repayment & Additional Information */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Expected Repayment Sources */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={22} color={C.primary} /> G. Expected Repayment Source of Funds
                </h3>
                <p style={{ color: C.gray500, margin: '0 0 1.25rem 0', fontSize: '0.85rem' }}>
                  Select the main expected avenues of income for clearing the solar loan.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: C.gray50,
                  borderRadius: '12px',
                  border: `1px solid ${C.gray200}`,
                  marginBottom: '1.5rem'
                }}>
                  {['Salary', 'Pension', 'Interest/Dividends', 'Rental Income', 'Gratuity'].map((source) => (
                    <label key={source} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: '600', color: C.gray700 }}>
                      <input
                        type="checkbox"
                        checked={formData.funding.sources.includes(source)}
                        onChange={(e) => handleCheckboxChange(source, e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: C.primary,
                          cursor: 'pointer'
                        }}
                      />
                      <span>{source}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Monthly Income Amount (₦) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 150000"
                      value={formData.funding.monthlyIncomeAmount}
                      onChange={(e) => handleNestedInputChange('funding', 'monthlyIncomeAmount', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>Yearly Income Amount (₦) - Auto Calculated</label>
                    <input
                      type="number"
                      readOnly
                      placeholder="Calculated automatically"
                      value={formData.funding.yearlyIncomeAmount}
                      style={{ ...styles.input, backgroundColor: C.gray100, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={22} color={C.primary} /> E. Additional Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>
                      What is your expected source of income or fund for the Solar Loan? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Detail how the loan installments will be funded..."
                      value={formData.additional.expectedSourceOfIncome}
                      onChange={(e) => handleNestedInputChange('additional', 'expectedSourceOfIncome', e.target.value)}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>
                        Have you changed your residential address in the last 12 months? *
                      </label>
                      <select
                        value={formData.additional.changedAddressLast12Months}
                        onChange={(e) => handleNestedInputChange('additional', 'changedAddressLast12Months', e.target.value)}
                        style={styles.select}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>
                        How did you hear about LNE Mobile Int’l?
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Radio, Billboard, Social Media, Referral"
                        value={formData.additional.heardAboutLne}
                        onChange={(e) => handleNestedInputChange('additional', 'heardAboutLne', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  {formData.additional.changedAddressLast12Months === 'Yes' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>
                        Previous House Address *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Please state previous house address"
                        value={formData.additional.previousAddress}
                        onChange={(e) => handleNestedInputChange('additional', 'previousAddress', e.target.value)}
                        style={styles.textarea}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: C.gray700, marginBottom: '0.4rem' }}>
                      If a referral, please state source with contact details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Obi (+234 802 333 4444)"
                      value={formData.additional.referralSourceAndContact}
                      onChange={(e) => handleNestedInputChange('additional', 'referralSourceAndContact', e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: KYC Verification Document Requests & Declaration */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={22} color={C.primary} /> F. Documents Request for KYC Verification
                </h3>
                <p style={{ color: C.gray500, margin: 0, fontSize: '0.85rem' }}>
                  Capture or upload high-resolution images/PDFs of the required KYC identification documents.
                </p>
              </div>

              <div style={{
                backgroundColor: C.gray50,
                border: `1px solid ${C.gray200}`,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{ padding: '1rem', background: C.white, borderRadius: '10px', border: `1px solid ${C.gray200}` }}>
                  <CameraCapture
                    label="1. ID Document *"
                    required={true}
                    onCapture={(blob) => handleImageCapture('id_document_image', blob)}
                  />
                  <div style={{ fontSize: '0.75rem', color: C.gray500, marginTop: '0.4rem' }}>
                    Passport, National ID, Voter's Card, or Tax Clearance
                  </div>
                </div>

                <div style={{ padding: '1rem', background: C.white, borderRadius: '10px', border: `1px solid ${C.gray200}` }}>
                  <CameraCapture
                    label="2. Utility Bill *"
                    required={true}
                    onCapture={(blob) => handleImageCapture('utility_bill_image', blob)}
                  />
                  <div style={{ fontSize: '0.75rem', color: C.gray500, marginTop: '0.4rem' }}>
                    Current utility receipt (PHCN, water rate, waste etc.)
                  </div>
                </div>

                <div style={{ padding: '1rem', background: C.white, borderRadius: '10px', border: `1px solid ${C.gray200}` }}>
                  <CameraCapture
                    label="3. Bank Statement (1 Year)"
                    onCapture={(blob) => handleImageCapture('bank_statement_image', blob)}
                  />
                  <div style={{ fontSize: '0.75rem', color: C.gray500, marginTop: '0.4rem' }}>
                    Official account summary history for credit assessment
                  </div>
                </div>

                <div style={{ padding: '1rem', background: C.white, borderRadius: '10px', border: `1px solid ${C.gray200}` }}>
                  <CameraCapture
                    label="4. Residence Permit (Expatriates)"
                    onCapture={(blob) => handleImageCapture('residence_permit_image', blob)}
                  />
                  <div style={{ fontSize: '0.75rem', color: C.gray500, marginTop: '0.4rem' }}>
                    Current permit issued by Immigration (if expatriate)
                  </div>
                </div>
              </div>

              {/* Declaration Statement */}
              <div style={{
                borderTop: `1px solid ${C.gray200}`,
                paddingTop: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.gray700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={22} color={C.primary} /> H. DECLARATION
                </h3>

                <div style={{
                  padding: '1.5rem',
                  backgroundColor: C.primaryLight,
                  border: `1.5px solid ${C.primary}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: C.gray700,
                    lineHeight: '1.6',
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    I, <span style={{ textDecoration: 'underline', fontWeight: '800', color: C.primaryDark }}>
                      {formData.declaration.name || '____________'}
                    </span>, hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I understand to inform you of any changes therein.
                  </p>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      required
                      checked={formData.declaration.agreed}
                      onChange={(e) => handleNestedInputChange('declaration', 'agreed', e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: C.primary,
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: C.primaryDark }}>
                      I agree and confirm the declaration above *
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${C.gray200}`,
            paddingTop: '1.5rem',
            marginTop: '1rem'
          }}>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                style={styles.backButton}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft || submitting}
                style={{
                  ...styles.backButton,
                  backgroundColor: C.white,
                  color: C.primary,
                  borderColor: C.primary,
                  opacity: (savingDraft || submitting) ? 0.6 : 1,
                  cursor: (savingDraft || submitting) ? 'not-allowed' : 'pointer'
                }}
              >
                {savingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {savingDraft ? 'Saving...' : 'Save Draft'}
              </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                style={styles.nextButton}
              >
                Save & Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || savingDraft}
                style={{
                  ...styles.submitButton,
                  opacity: (submitting || savingDraft) ? 0.65 : 1,
                  cursor: (submitting || savingDraft) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Submit Customer Survey
                  </>
                )}
              </button>
            )}
            </div>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: C.gray700,
    backgroundColor: C.white,
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: C.primary
    }
  },
  select: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: C.gray700,
    backgroundColor: C.white,
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: C.gray700,
    resize: 'vertical'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: C.gray100,
    color: C.gray700,
    border: `1px solid ${C.gray200}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  nextButton: {
    padding: '0.75rem 1.75rem',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,168,89,0.15)'
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,168,89,0.25)'
  }
};

export default EligibilitySurveyFormPage;
