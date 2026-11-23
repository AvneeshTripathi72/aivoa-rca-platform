import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Ban, 
  Check, 
  HelpCircle,
  Building,
  Calendar,
  Layers,
  Activity,
  FileCheck,
  ChevronRight,
  Upload,
  Info
} from 'lucide-react';
import { CopilotAPI, InvestigationAPI } from '../services/api';

export default function NewInvestigationWorkspacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode & Form Data
  const [formData, setFormData] = useState({
    // 1. Origin & Customer / Incident Details
    complaint_source: '',
    customer_name: '',
    contact_info: '',
    
    // 2. Product & Batch Identification
    product_name: '',
    dosage_form: '',
    product_strength: '',
    batch_number: '',
    affected_quantity: '',
    manufacturing_date: '',
    expiry_date: '',
    
    // 3. Facility & Material Impact
    originating_site_block: '',
    impacted_npm: '',
    equipment_id: '',
    manufacturing_stage: '',

    // 4. Defect / Excursion Analysis
    defect_category: '',
    title: '',
    incident_description: '',
    suggested_next_action: '',

    // Initial Risk Assessment
    initial_severity: 'Major',
    risk_justification: '',
    defect_nature: '',
    regulatory_impact: '21 CFR 211.198 / Schedule M Compliance Review Required'
  });

  const [triageStatus, setTriageStatus] = useState('Pending Triage'); // 'Pending Triage' | 'Ready to Commit'
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(null);

  // Copilot Chat State
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello! I am your AIVOA Incident & Complaint Copilot. Drop incident investigation files or paste complaint/excursion text below. I will auto-extract batch details, facility impact, and defect telemetry directly into the QMS triage ledger.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tool: 'assistant_greeting'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Check if form has data to update triage status
  useEffect(() => {
    const hasCoreData = formData.product_name && (formData.batch_number || formData.incident_description);
    if (hasCoreData) {
      setTriageStatus('Ready to Commit');
    } else {
      setTriageStatus('Pending Triage');
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !uploadedFile) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      attachment: uploadedFile ? { name: uploadedFile.name, size: (uploadedFile.size / 1024).toFixed(1) + ' KB' } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const fileToUpload = uploadedFile;
    setUploadedFile(null);
    setIsThinking(true);

    try {
      let response;
      if (fileToUpload) {
        response = await CopilotAPI.uploadDocument(fileToUpload, textToSend);
      } else {
        response = await CopilotAPI.chat(textToSend, formData);
      }

      const copilotData = response.data;

      // Update form fields with extracted data if available
      if (copilotData.extracted_data) {
        setFormData(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(copilotData.extracted_data).filter(([_, v]) => v !== null && v !== undefined && v !== '')
          )
        }));
      }

      // Add assistant response
      const assistantMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: copilotData.reply_message || "Extracted incident metadata into the QMS triage form.",
        action_type: copilotData.action_type,
        tool_used: copilotData.tool_used,
        updated_fields: copilotData.updated_fields || [],
        risk_assessment: copilotData.risk_assessment,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Also update risk assessment in form if returned
      if (copilotData.risk_assessment) {
        setFormData(prev => ({
          ...prev,
          initial_severity: copilotData.risk_assessment.severity || prev.initial_severity,
          risk_justification: copilotData.risk_assessment.justification || prev.risk_justification,
          defect_nature: copilotData.risk_assessment.defect_nature || prev.defect_nature,
          regulatory_impact: copilotData.risk_assessment.regulatory_impact || prev.regulatory_impact
        }));
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Copilot Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I encountered an error processing your request. Please check if the backend API is online.",
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleCommitToLedger = async () => {
    if (!formData.product_name && !formData.title && !formData.batch_number) {
      alert("Please extract or input minimum product/batch information before committing to the QMS ledger.");
      return;
    }

    setIsCommitting(true);
    try {
      const payload = {
        title: formData.title || `${formData.product_name || 'Pharmaceutical'} - ${formData.defect_category || 'Quality Excursion'}`,
        incident_description: formData.incident_description || `${formData.defect_category || 'Excursion'}: Batch ${formData.batch_number}. Details extracted via AIVOA Copilot.`,
        product_name: formData.product_name || 'Unspecified API / Product',
        dosage_form: formData.dosage_form || 'API',
        product_strength: formData.product_strength || 'Standard',
        batch_number: formData.batch_number || 'PENDING-BATCH',
        manufacturing_stage: formData.manufacturing_stage || 'Bulk Manufacturing',
        equipment_id: formData.equipment_id || 'PLANT-EQUIP',
        incident_date: formData.manufacturing_date || new Date().toISOString().split('T')[0],
        severity: formData.initial_severity || 'Major',
        assigned_investigator: 'Dr. Sarah Lin (Lead QA)',
        complaint_source: formData.complaint_source || 'Manufacturing Operations',
        customer_name: formData.customer_name || 'Internal Quality Unit',
        contact_info: formData.contact_info || 'quality@aivoa.pharma',
        affected_quantity: formData.affected_quantity || 'Under Evaluation',
        manufacturing_date: formData.manufacturing_date,
        expiry_date: formData.expiry_date,
        originating_site_block: formData.originating_site_block || 'Active Manufacturing Block',
        impacted_npm: formData.impacted_npm,
        defect_category: formData.defect_category || 'Critical Quality Attribute Deviation',
        suggested_next_action: formData.suggested_next_action || 'Execute 5 Whys and 6M Fishbone Root Cause Analysis',
        initial_risk_assessment: {
          severity: formData.initial_severity,
          justification: formData.risk_justification || 'Critical quality attribute excursion affecting API integrity.',
          defect_nature: formData.defect_nature || 'Thermal / Analytical Excursion',
          regulatory_impact: formData.regulatory_impact
        }
      };

      const res = await CopilotAPI.commit(payload);
      setCommitSuccess(res.data);
      
      // Navigate to full Root Cause Investigation page after brief visual confirmation
      setTimeout(() => {
        navigate(`/investigations/${res.data.investigation_id}`);
      }, 1200);

    } catch (err) {
      console.error("Failed to commit investigation:", err);
      alert("Failed to commit investigation to QMS ledger. Check backend logs.");
    } finally {
      setIsCommitting(false);
    }
  };

  // Preset demo queries matching the video demo
  const sampleScenarios = [
    {
      label: "Apollo Pharmacy Complaint",
      prompt: "Log a customer complaint from Apollo Pharmacy regarding Atorvastatin Calcium 20mg, batch number ATC-2026-088. Customer reports tablet discoloration and specking in blister packs. 120 blister packs affected. Manufacturing date was 2026-01-15, expiry 2028-01-14 from Site 01 Block C."
    },
    {
      label: "Crystallizer-04 Temperature Spike",
      prompt: "Log manufacturing excursion: Reactor Crystallizer-04 experienced a 14.8°C thermal excursion for 42 minutes during API crystallization batch API-BT-2026-014. Mother liquor turbidity increased. Site Block B Unit 3."
    },
    {
      label: "Refine Batch & Quantity",
      prompt: "Ah sorry, the batch number is BMX240602 and the affected quantity is 48 capsules."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xs flex items-center tracking-wide">
            AIVOA
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Quality Management System (QMS)</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-800 font-semibold">Incident Intake & QMS Triage</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">ICH Q9 / 21 CFR Part 11 Active</span>
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Ledger Connected</span>
          </div>
        </div>
      </div>

      {/* Main Split Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1720px] w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: QMS Structured Incident Intake Form                           */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-7/12 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h1 className="text-lg font-bold text-slate-900">Incident Intake & QMS Triage</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Live intake form synchronized with AIVOA Copilot AI extraction engine
              </p>
            </div>

            {/* Triage Status Badge */}
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 border ${
                triageStatus === 'Ready to Commit' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  triageStatus === 'Ready to Commit' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
                <span>{triageStatus}</span>
              </div>
            </div>
          </div>

          {/* Form Scroll Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Section 1: Origin & Customer/Incident Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                <span>ORIGIN & CUSTOMER / INCIDENT DETAILS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Complaint / Incident Source</label>
                  <InputFieldWithPlaceholder 
                    value={formData.complaint_source}
                    onChange={(v) => handleInputChange('complaint_source', v)}
                    placeholderText="Customer / Hospital / Manufacturing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Customer / Reporting Entity</label>
                  <InputFieldWithPlaceholder 
                    value={formData.customer_name}
                    onChange={(v) => handleInputChange('customer_name', v)}
                    placeholderText="e.g., Apollo Pharmacy / QA Ops"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Information</label>
                  <InputFieldWithPlaceholder 
                    value={formData.contact_info}
                    onChange={(v) => handleInputChange('contact_info', v)}
                    placeholderText="Email or Department"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Product & Batch Identification */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                <span>PRODUCT & BATCH IDENTIFICATION</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Product Name</label>
                  <InputFieldWithPlaceholder 
                    value={formData.product_name}
                    onChange={(v) => handleInputChange('product_name', v)}
                    placeholderText="e.g., Atorvastatin Calcium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Finished Dosage Form / Grade</label>
                  <InputFieldWithPlaceholder 
                    value={formData.dosage_form}
                    onChange={(v) => handleInputChange('dosage_form', v)}
                    placeholderText="e.g., Film-Coated Tablet / Micronized API"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dosage Strength</label>
                  <InputFieldWithPlaceholder 
                    value={formData.product_strength}
                    onChange={(v) => handleInputChange('product_strength', v)}
                    placeholderText="e.g., 20mg / 99.8% purity"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Batch / Lot Number</label>
                  <InputFieldWithPlaceholder 
                    value={formData.batch_number}
                    onChange={(v) => handleInputChange('batch_number', v)}
                    placeholderText="e.g., ATC-2026-088"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Affected Quantity (Units)</label>
                  <InputFieldWithPlaceholder 
                    value={formData.affected_quantity}
                    onChange={(v) => handleInputChange('affected_quantity', v)}
                    placeholderText="e.g., 120 blister packs / 180 kg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Manufacturing Date</label>
                  <InputFieldWithPlaceholder 
                    value={formData.manufacturing_date}
                    onChange={(v) => handleInputChange('manufacturing_date', v)}
                    placeholderText="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                  <InputFieldWithPlaceholder 
                    value={formData.expiry_date}
                    onChange={(v) => handleInputChange('expiry_date', v)}
                    placeholderText="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Manufacturing Stage</label>
                  <InputFieldWithPlaceholder 
                    value={formData.manufacturing_stage}
                    onChange={(v) => handleInputChange('manufacturing_stage', v)}
                    placeholderText="e.g., Crystallization / Secondary Packaging"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Facility & Material Impact */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">3</span>
                <span>FACILITY & MATERIAL IMPACT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Originating Site & Block</label>
                  <InputFieldWithPlaceholder 
                    value={formData.originating_site_block}
                    onChange={(v) => handleInputChange('originating_site_block', v)}
                    placeholderText="e.g., Site 01, Block C"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Impacted Non-Product Material (NPM)</label>
                  <InputFieldWithPlaceholder 
                    value={formData.impacted_npm}
                    onChange={(v) => handleInputChange('impacted_npm', v)}
                    placeholderText="e.g., Alu-Alu Foil / Purified Water"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Associated Equipment ID</label>
                  <InputFieldWithPlaceholder 
                    value={formData.equipment_id}
                    onChange={(v) => handleInputChange('equipment_id', v)}
                    placeholderText="e.g., BLIST-PACK-02 / CR-04"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Defect / Excursion Analysis */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">4</span>
                <span>DEFECT / EXCURSION ANALYSIS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Defect Category</label>
                  <InputFieldWithPlaceholder 
                    value={formData.defect_category}
                    onChange={(v) => handleInputChange('defect_category', v)}
                    placeholderText="e.g., Visual Defect / Thermal Excursion"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Incident Headline</label>
                  <InputFieldWithPlaceholder 
                    value={formData.title}
                    onChange={(v) => handleInputChange('title', v)}
                    placeholderText="e.g., Tablet Discoloration & Specking"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Defect / Excursion Description</label>
                  <textarea 
                    value={formData.incident_description}
                    onChange={(e) => handleInputChange('incident_description', e.target.value)}
                    rows={3}
                    placeholder="Awaiting AI extraction of technical incident details..."
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400 placeholder:italic"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Suggested Immediate Containment / Next Action</label>
                  <InputFieldWithPlaceholder 
                    value={formData.suggested_next_action}
                    onChange={(v) => handleInputChange('suggested_next_action', v)}
                    placeholderText="e.g., Quaratine batch inventory and review environmental loggers"
                  />
                </div>
              </div>
            </div>

            {/* AI Copilot Risk Assessment Card (As seen in reference video) */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-xl border border-indigo-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                    AI Copilot Risk Assessment
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  formData.initial_severity === 'Critical'
                    ? 'bg-red-100 text-red-800'
                    : formData.initial_severity === 'Major'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {formData.initial_severity || 'Major'} Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-50">
                  <span className="text-slate-500 block text-[11px] font-medium">Defect Nature & Vector:</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {formData.defect_nature || 'Awaiting telemetry...'}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-50">
                  <span className="text-slate-500 block text-[11px] font-medium">Regulatory Framework:</span>
                  <span className="text-indigo-700 font-semibold mt-0.5 block">
                    {formData.regulatory_impact}
                  </span>
                </div>
              </div>

              {formData.risk_justification && (
                <div className="text-xs text-slate-600 bg-white/60 p-2.5 rounded-lg border border-indigo-50">
                  <span className="font-semibold text-slate-700">Risk Justification: </span>
                  {formData.risk_justification}
                </div>
              )}
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Data entered or extracted here will initialize the official RCA Investigation dossier.</span>
            </div>
            <button
              onClick={handleCommitToLedger}
              disabled={isCommitting || triageStatus !== 'Ready to Commit'}
              className={`px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition shadow-sm ${
                triageStatus === 'Ready to Commit' && !isCommitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isCommitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Committing to QMS Ledger...</span>
                </>
              ) : commitSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Committed! Launching RCA...</span>
                </>
              ) : (
                <>
                  <span>Commit to QMS Ledger & Launch RCA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: AIVOA Copilot Interactive Assistant (Video Match)             */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-5/12 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Copilot Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900">AIVOA Copilot</h2>
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Drop complaint files or paste text below.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setFormData({
                  complaint_source: '',
                  customer_name: '',
                  contact_info: '',
                  product_name: '',
                  dosage_form: '',
                  product_strength: '',
                  batch_number: '',
                  affected_quantity: '',
                  manufacturing_date: '',
                  expiry_date: '',
                  originating_site_block: '',
                  impacted_npm: '',
                  equipment_id: '',
                  manufacturing_stage: '',
                  defect_category: '',
                  title: '',
                  incident_description: '',
                  suggested_next_action: '',
                  initial_severity: 'Major',
                  risk_justification: '',
                  defect_nature: '',
                  regulatory_impact: '21 CFR 211.198 / Schedule M Compliance Review Required'
                });
                setMessages([
                  {
                    id: 'msg-reset',
                    sender: 'assistant',
                    text: 'Form reset. Drop a document or paste new incident notes to begin extraction.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              title="Reset Form & Chat"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  
                  {/* Assistant Header Tag */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-600 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AIVOA Copilot</span>
                      {msg.tool_used && (
                        <span className="text-[10px] font-normal px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                          {msg.tool_used}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Attachment card in user message */}
                  {msg.attachment && (
                    <div className="mb-2 p-2 bg-indigo-700/50 rounded-lg flex items-center space-x-2 text-indigo-100">
                      <FileText className="w-4 h-4 text-indigo-200" />
                      <div className="flex-1 truncate">
                        <span className="font-semibold block truncate">{msg.attachment.name}</span>
                        <span className="text-[10px] text-indigo-300">{msg.attachment.size}</span>
                      </div>
                    </div>
                  )}

                  {/* Body Text */}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* Updated Fields Badge List */}
                  {msg.updated_fields && msg.updated_fields.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Synchronized Fields:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.updated_fields.map((f, i) => (
                          <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Thinking / Streaming Indicator */}
            {isThinking && (
              <div className="flex items-start space-x-2">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-slate-500 font-medium ml-1">Analyzing incident telemetry...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Scenario Pills */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
              Quick Scenarios (Video Demo):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleScenarios.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sc.prompt)}
                  disabled={isThinking}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition border border-slate-200 hover:border-indigo-200 cursor-pointer text-left truncate max-w-[200px]"
                  title={sc.prompt}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Attachment Chip */}
          {uploadedFile && (
            <div className="px-4 py-1.5 bg-indigo-50/60 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold truncate">{uploadedFile.name}</span>
                <span className="text-[10px] text-slate-500">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button 
                onClick={() => setUploadedFile(null)}
                className="text-slate-400 hover:text-red-500 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center space-x-2">
              {/* File Attachment Hidden Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt"
                className="hidden" 
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Investigation PDF or Notes"
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type complaint details or ask to edit a field..."
                disabled={isThinking}
                className="flex-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isThinking || (!inputText.trim() && !uploadedFile)}
                className={`p-2 rounded-lg text-white transition ${
                  isThinking || (!inputText.trim() && !uploadedFile)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-sm active:scale-95'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Micro Compliance Footer */}
            <div className="mt-2 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                POWERED BY LANGGRAPH • GROQ LLM ORCHESTRATION • 21 CFR PART 11 COMPLIANT
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/**
 * Helper component: Shows a red ban circle + "Awaiting AI extraction..." when empty,
 * and a clean editable text input once populated or focused.
 */
function InputFieldWithPlaceholder({ value, onChange, placeholderText }) {
  const [isFocused, setIsFocused] = useState(false);

  if (!value && !isFocused) {
    return (
      <div 
        onClick={() => setIsFocused(true)}
        className="w-full text-xs bg-slate-50 border border-slate-200 border-dashed rounded-lg px-2.5 py-2 flex items-center justify-between text-slate-400 cursor-text hover:bg-white hover:border-slate-300 transition"
      >
        <span className="italic truncate">{placeholderText || "Awaiting AI extraction..."}</span>
        <Ban className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1.5" />
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setIsFocused(false)}
      autoFocus={isFocused}
      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
    />
  );
}
