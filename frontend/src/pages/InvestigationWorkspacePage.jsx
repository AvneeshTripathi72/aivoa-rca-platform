import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchInvestigationById, 
  updateInvestigationField,
  updateStatusThunk,
  approveInvestigationThunk 
} from '../redux/investigationSlice';
import { 
  RootCauseAPI, 
  CapaAPI, 
  EvidenceAPI, 
  InvestigationAPI 
} from '../services/api';
import StatusStepper from '../components/StatusStepper';
import AIBadge from '../components/AIBadge';
import {
  Sparkles,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
  ClipboardList,
  FolderGit2,
  Lock,
  UserCheck
} from 'lucide-react';

export default function InvestigationWorkspacePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentInvestigation: inv, detailLoading: loading } = useSelector(
    (state) => state.investigations
  );

  const [activeTab, setActiveTab] = useState('five_whys'); // overview | five_whys | fishbone | evidence | capa | summary

  // 5 Whys state
  const [fiveWhysList, setFiveWhysList] = useState([]);
  const [newWhyQuestion, setNewWhyQuestion] = useState('');
  const [newWhyAnswer, setNewWhyAnswer] = useState('');

  // Fishbone causes state
  const [fishboneList, setFishboneList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Machine');
  const [newCauseDesc, setNewCauseDesc] = useState('');
  const [newCauseStrength, setNewCauseStrength] = useState('Moderate');

  // Evidence state
  const [evidenceList, setEvidenceList] = useState([]);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    title: '',
    evidence_type: 'Analytical Laboratory Result',
    source_reference: '',
    observation: '',
    review_status: 'Verified'
  });

  // CAPA state
  const [capaList, setCapaList] = useState([]);
  const [showAddCapa, setShowAddCapa] = useState(false);
  const [newCapa, setNewCapa] = useState({
    action_type: 'Corrective',
    description: '',
    associated_root_cause: '',
    priority: 'High',
    owner: 'Engineering & Metrology',
    due_date: '30 Days',
    verification_criteria: '',
    effectiveness_result: ''
  });

  // Approval Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approverName, setApproverName] = useState('Dr. Eleanor Vance, Senior QA Specialist');
  const [approvalComments, setApprovalComments] = useState('All root causes substantiated by empirical evidence and SCADA logs. Approved under GMP authority.');

  useEffect(() => {
    if (id) {
      dispatch(fetchInvestigationById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (inv) {
      setFiveWhysList(inv.five_whys_steps || []);
      setFishboneList(inv.root_causes || []);
      setEvidenceList(inv.evidence_items || []);
      setCapaList(inv.capa_actions || []);
    }
  }, [inv]);

  if (loading || !inv) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading RCA Investigation workspace...</p>
      </div>
    );
  }

  // Handle 5 Whys updates
  const handleUpdateWhy = async (stepId, updatedFields) => {
    try {
      await RootCauseAPI.updateFiveWhys(stepId, updatedFields);
      setFiveWhysList((prev) =>
        prev.map((step) => (step.id === stepId ? { ...step, ...updatedFields } : step))
      );
    } catch (err) {
      console.error('Failed to update 5 Whys step', err);
    }
  };

  const handleAddWhyStep = async () => {
    if (!newWhyQuestion.trim() || !newWhyAnswer.trim()) return;
    try {
      const nextSeq = fiveWhysList.length + 1;
      const res = await RootCauseAPI.addFiveWhys(inv.id, {
        sequence_number: nextSeq,
        question: newWhyQuestion,
        answer: newWhyAnswer,
        evidence_reference: 'Investigator Physical Verification',
        is_root_cause: nextSeq >= 4,
        status: 'Human-Validated'
      });
      setFiveWhysList((prev) => [...prev, res.data]);
      setNewWhyQuestion('');
      setNewWhyAnswer('');
    } catch (err) {
      console.error('Failed to add 5 Whys step', err);
    }
  };

  // Handle Fishbone Cause updates
  const handleUpdateCause = async (causeId, updatedFields) => {
    try {
      await RootCauseAPI.update(causeId, updatedFields);
      setFishboneList((prev) =>
        prev.map((c) => (c.id === causeId ? { ...c, ...updatedFields } : c))
      );
    } catch (err) {
      console.error('Failed to update root cause', err);
    }
  };

  // Handle CAPA Status updates
  const handleUpdateCapaStatus = async (capaId, newStatus) => {
    try {
      const res = await CapaAPI.update(capaId, { status: newStatus });
      setCapaList((prev) =>
        prev.map((c) => (c.id === capaId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update CAPA status', err);
    }
  };

  const handleCreateCapa = async () => {
    if (!newCapa.description.trim()) return;
    try {
      const res = await CapaAPI.create(inv.id, newCapa);
      setCapaList((prev) => [...prev, res.data]);
      setShowAddCapa(false);
      setNewCapa({
        action_type: 'Corrective',
        description: '',
        associated_root_cause: '',
        priority: 'High',
        owner: 'Engineering & Metrology',
        due_date: '30 Days',
        verification_criteria: '',
        effectiveness_result: ''
      });
    } catch (err) {
      console.error('Failed to create CAPA', err);
    }
  };

  const handleCreateEvidence = async () => {
    if (!newEvidence.title.trim()) return;
    try {
      const res = await EvidenceAPI.create(inv.id, newEvidence);
      setEvidenceList((prev) => [...prev, res.data]);
      setShowAddEvidence(false);
      setNewEvidence({
        title: '',
        evidence_type: 'Analytical Laboratory Result',
        source_reference: '',
        observation: '',
        review_status: 'Verified'
      });
    } catch (err) {
      console.error('Failed to create Evidence', err);
    }
  };

  const handleFormalApproval = async () => {
    try {
      await dispatch(
        approveInvestigationThunk({
          id: inv.id,
          approver: approverName,
          comments: approvalComments
        })
      );
      setShowApproveModal(false);
    } catch (err) {
      console.error('Failed to approve investigation', err);
    }
  };

  const FISHBONE_CATEGORIES = ['Machine', 'Method', 'Material', 'Measurement', 'Man', 'Environment'];

  return (
    <div className="space-y-6">
      {/* Investigation Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {inv.investigation_number}
            </span>
            <span className="text-xs text-slate-500 font-medium">Batch: <strong className="text-slate-800 font-mono">{inv.batch_number}</strong></span>
            <span className="text-xs text-slate-500 font-medium">Stage: <strong className="text-slate-800">{inv.manufacturing_stage}</strong></span>
            <span className="text-xs text-slate-500 font-medium">Severity: <strong className="text-amber-700">{inv.severity}</strong></span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{inv.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{inv.product_name} • Investigator: {inv.investigator}</p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          {inv.investigation_status !== 'Closed' ? (
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign & Approve Investigation</span>
            </button>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Investigation Approved & Closed</span>
            </span>
          )}
        </div>
      </div>

      {/* Lifecycle Status Stepper */}
      <StatusStepper
        currentStatus={inv.investigation_status}
        onStepClick={(step) => {
          dispatch(
            updateStatusThunk({
              id: inv.id,
              status: step,
              notes: `Investigator transitioned status to ${step}`,
              investigator: inv.investigator
            })
          );
        }}
      />

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('five_whys')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeTab === 'five_whys'
              ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>5 Whys Analysis</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
            {fiveWhysList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fishbone')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeTab === 'fishbone'
              ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fishbone (6M Ishikawa)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
            {fishboneList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeTab === 'evidence'
              ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Evidence Registry</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {evidenceList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('capa')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeTab === 'capa'
              ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>CAPA Action Matrix</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 font-mono">
            {capaList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeTab === 'summary'
              ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Executive Quality Report</span>
        </button>
      </div>

      {/* ================= TAB 1: 5 WHYS CAUSAL FLOW ================= */}
      {activeTab === 'five_whys' && (
        <div className="space-y-6">
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 flex items-start space-x-3">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">5 Whys Causal Sequence</p>
              <p className="text-[11px] text-blue-800/90 mt-0.5">
                Investigating step-by-step from the symptom (Impurity B alert excursion) down to the physical and organizational root causes. Each answer must reference physical evidence.
              </p>
            </div>
          </div>

          {/* Sequential 5 Whys Flow */}
          <div className="space-y-4">
            {fiveWhysList.map((step, idx) => (
              <div
                key={step.id || idx}
                className={`bg-white rounded-xl border p-4.5 shadow-2xs transition ${
                  step.is_root_cause ? 'border-purple-300 ring-2 ring-purple-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-navy-800 text-white font-bold text-xs flex items-center justify-center">
                      {step.sequence_number || idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Why #{step.sequence_number || idx + 1}</span>
                    {step.is_root_cause && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        Primary Systemic Root Cause
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      step.status === 'Human-Validated'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {step.status}
                    </span>
                    {step.status !== 'Human-Validated' && (
                      <button
                        onClick={() => handleUpdateWhy(step.id, { status: 'Human-Validated' })}
                        className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Confirm Answer</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question & Answer */}
                <div className="space-y-2 mt-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Question:</span>
                    <input
                      type="text"
                      value={step.question}
                      onChange={(e) => handleUpdateWhy(step.id, { question: e.target.value })}
                      className="w-full mt-0.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Causal Answer:</span>
                    <textarea
                      rows={2}
                      value={step.answer}
                      onChange={(e) => handleUpdateWhy(step.id, { answer: e.target.value })}
                      className="w-full mt-0.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 font-sans"
                    />
                  </div>

                  {step.evidence_reference && (
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-1">
                      <FolderGit2 className="w-3.5 h-3.5 text-blue-500" />
                      <span><strong>Traceable Source:</strong> {step.evidence_reference}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Custom Why Step */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-700">Add Next Why Step to Causal Chain</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Enter next question (Why did...)"
                  value={newWhyQuestion}
                  onChange={(e) => setNewWhyQuestion(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
                <input
                  type="text"
                  placeholder="Enter empirical causal answer..."
                  value={newWhyAnswer}
                  onChange={(e) => setNewWhyAnswer(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
              <button
                onClick={handleAddWhyStep}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FISHBONE (6M ISHIKAWA) ================= */}
      {activeTab === 'fishbone' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 flex items-start space-x-3">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-900">Ishikawa 6M Diagram (API Pharmaceutical Manufacturing)</p>
              <p className="text-[11px] text-indigo-800/90 mt-0.5">
                Evaluation across Machine, Method, Material, Measurement, Man, and Environment. AI findings are candidate hypotheses; only human investigators can officially validate root causes.
              </p>
            </div>
          </div>

          {/* 6M Category Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {FISHBONE_CATEGORIES.map((cat) => {
              const count = fishboneList.filter((c) => c.cause_category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 ${
                    selectedCategory === cat
                      ? 'bg-navy-800 text-white border-navy-800 shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Causes List for Selected Category */}
          <div className="space-y-4">
            {fishboneList
              .filter((c) => c.cause_category === selectedCategory)
              .map((cause) => (
                <div
                  key={cause.id}
                  className={`bg-white rounded-xl border p-4.5 shadow-2xs space-y-3 ${
                    cause.is_primary_root_cause ? 'border-purple-300 ring-2 ring-purple-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-xs text-slate-900">{cause.cause_category}</span>
                      {cause.is_primary_root_cause && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                          Primary Root Cause
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cause.evidence_strength === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        cause.evidence_strength === 'Moderate' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        Evidence: {cause.evidence_strength}
                      </span>
                    </div>

                    {/* Verification Status Selector (Human in the loop) */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold text-slate-500">Investigator Decision:</span>
                      <select
                        value={cause.verification_status}
                        onChange={(e) => handleUpdateCause(cause.id, { verification_status: e.target.value })}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition ${
                          cause.verification_status === 'Human-Confirmed'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : cause.verification_status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        }`}
                      >
                        <option value="Hypothesis">Hypothesis (Unverified)</option>
                        <option value="Evidence-Supported">Evidence-Supported</option>
                        <option value="Human-Confirmed">Human-Confirmed (Approved)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {cause.cause_description}
                  </p>

                  {/* Supporting / Contradictory Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1">
                      <span className="font-bold text-emerald-900 flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Supporting Evidence:</span>
                      </span>
                      {cause.supporting_evidence && cause.supporting_evidence.length > 0 ? (
                        cause.supporting_evidence.map((s, idx) => (
                          <p key={idx} className="text-emerald-950 font-sans">• {s}</p>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">None recorded</p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 space-y-1">
                      <span className="font-bold text-rose-900 flex items-center space-x-1">
                        <X className="w-3 h-3 text-rose-600" />
                        <span>Contradictory / Non-Corroborating Evidence:</span>
                      </span>
                      {cause.contradictory_evidence && cause.contradictory_evidence.length > 0 ? (
                        cause.contradictory_evidence.map((s, idx) => (
                          <p key={idx} className="text-rose-950 font-sans">• {s}</p>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">None recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Investigator Decision Notes */}
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-600">Investigator Decision Rationale:</span>
                    <input
                      type="text"
                      placeholder="Add formal investigator note or reference testing memo..."
                      value={cause.investigator_decision_notes || ''}
                      onChange={(e) => handleUpdateCause(cause.id, { investigator_decision_notes: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: EVIDENCE REGISTRY ================= */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Traceable GMP Evidence Records</h3>
              <p className="text-xs text-slate-500">Documentary proof supporting or refuting root cause hypotheses.</p>
            </div>
            <button
              onClick={() => setShowAddEvidence(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Evidence Record</span>
            </button>
          </div>

          {/* Add Evidence Modal/Form */}
          {showAddEvidence && (
            <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm space-y-3 text-xs">
              <span className="font-bold text-blue-900">Add New Evidence Record</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Evidence Title (e.g. SCADA Temperature Log Step 4.4)"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                />
                <select
                  value={newEvidence.evidence_type}
                  onChange={(e) => setNewEvidence({ ...newEvidence, evidence_type: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Analytical Laboratory Result">Analytical Laboratory Result</option>
                  <option value="Batch Manufacturing Record">Batch Manufacturing Record</option>
                  <option value="Process Log">Process Log / SCADA</option>
                  <option value="Calibration Record">Calibration Record</option>
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="Environmental Monitoring">Environmental Monitoring</option>
                  <option value="Personnel Statement">Personnel Statement</option>
                  <option value="SOP">SOP</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Source Document / Reference (e.g. BMR-2026-014 Page 8)"
                  value={newEvidence.source_reference}
                  onChange={(e) => setNewEvidence({ ...newEvidence, source_reference: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Observation / Finding"
                  value={newEvidence.observation}
                  onChange={(e) => setNewEvidence({ ...newEvidence, observation: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateEvidence}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white"
                >
                  Save Record
                </button>
                <button
                  onClick={() => setShowAddEvidence(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Evidence Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Evidence Title & Type</th>
                  <th className="py-3 px-4">Source Reference</th>
                  <th className="py-3 px-4">Observation / Finding</th>
                  <th className="py-3 px-4">Linked Root Cause</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {evidenceList.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{ev.title}</p>
                      <span className="text-[10px] text-blue-600 font-medium">{ev.evidence_type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {ev.source_reference || '—'}
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-800 leading-relaxed">
                      {ev.observation}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {ev.linked_root_cause || 'Crystallization valve friction'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ev.review_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CAPA ACTION MATRIX ================= */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Corrective & Preventive Action (CAPA) Roadmap</h3>
              <p className="text-xs text-slate-500">Rooted in validated causes. Not generic retraining.</p>
            </div>
            <button
              onClick={() => setShowAddCapa(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom CAPA</span>
            </button>
          </div>

          {/* Add CAPA Modal/Form */}
          {showAddCapa && (
            <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm space-y-3 text-xs">
              <span className="font-bold text-purple-900">Add New CAPA Recommendation</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={newCapa.action_type}
                  onChange={(e) => setNewCapa({ ...newCapa, action_type: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Corrective">Corrective Action</option>
                  <option value="Preventive">Preventive Action</option>
                </select>
                <select
                  value={newCapa.priority}
                  onChange={(e) => setNewCapa({ ...newCapa, priority: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <input
                  type="text"
                  placeholder="Action Description"
                  value={newCapa.description}
                  onChange={(e) => setNewCapa({ ...newCapa, description: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Owner Department or Role"
                  value={newCapa.owner}
                  onChange={(e) => setNewCapa({ ...newCapa, owner: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Target Due Date"
                  value={newCapa.due_date}
                  onChange={(e) => setNewCapa({ ...newCapa, due_date: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateCapa}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white"
                >
                  Create Action
                </button>
                <button
                  onClick={() => setShowAddCapa(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* CAPA Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capaList.map((capa) => (
              <div
                key={capa.id}
                className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-700">{capa.action_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        capa.action_type === 'Corrective'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {capa.action_type}
                      </span>
                    </div>

                    <select
                      value={capa.status}
                      onChange={(e) => handleUpdateCapaStatus(capa.id, e.target.value)}
                      className="text-[11px] font-bold rounded-lg px-2 py-1 bg-slate-50 border border-slate-200 text-slate-800"
                    >
                      <option value="Proposed">Proposed (AI)</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Effectiveness Pending">Effectiveness Pending</option>
                      <option value="Effective">Effective</option>
                      <option value="Ineffective">Ineffective</option>
                    </select>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                    {capa.description}
                  </p>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div><strong>Addressed Root Cause:</strong> {capa.associated_root_cause}</div>
                    <div><strong>Department Owner:</strong> {capa.owner}</div>
                    <div><strong>Target Completion:</strong> {capa.due_date}</div>
                    {capa.verification_criteria && (
                      <div><strong>Objective Verification:</strong> {capa.verification_criteria}</div>
                    )}
                    {capa.effectiveness_result && (
                      <div><strong>Effectiveness Criteria:</strong> {capa.effectiveness_result}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Priority: <strong className="text-slate-700">{capa.priority}</strong></span>
                  {capa.is_ai_generated && <AIBadge label="AI Proposed" confidence={0.92} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: EXECUTIVE SUMMARY ================= */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6 text-xs text-slate-800">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              ALCOA+ Compliant Quality Investigation Report
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              RCA Final Executive Summary & Conclusion
            </h2>
          </div>

          <div className="space-y-4 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">1. Incident Context & Detection</h4>
              <p className="text-slate-700">
                {inv.incident_description}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">2. Primary Validated Root Cause</h4>
              <p className="text-slate-700">
                {inv.investigation_summary?.primary_candidate_cause ||
                  'Mechanical stick-slip hysteresis on jacket cooling valve CV-402 caused prolonged intermediate solution hold at 42.5°C.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">3. Investigation Conclusion & Risk Disposition</h4>
              <p className="text-slate-700">
                {inv.investigation_summary?.investigation_conclusion ||
                  'The excursion is attributed to valve positioner friction. Batch conforms to registered shelf-life limits, but commercial release is gated pending completion of CAPA-2026-001 overhaul.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">4. Mandated Next Steps</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {(inv.investigation_summary?.next_steps || [
                  'Overhaul cooling valve positioner on CR-402',
                  'Execute intermediate solution thermal degradation kinetics curve',
                  'Formal review by Head of Quality Assurance'
                ]).map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Formal Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Sign & Approve RCA Investigation</h3>
            </div>
            <p className="text-xs text-slate-500">
              By confirming, you certify as the qualified Quality Investigator under GMP authority that all root causes have been scientifically verified.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Investigator Name / Role</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">GMP Approval Comments</label>
                <textarea
                  rows={3}
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFormalApproval}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Confirm & Close Investigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
