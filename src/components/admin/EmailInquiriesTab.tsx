import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  Send, 
  Phone, 
  ExternalLink, 
  Copy, 
  CheckCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Save, 
  ShieldCheck, 
  AlertCircle,
  CornerDownRight,
  Filter,
  Check,
  SendHorizontal,
  Loader2,
  RefreshCw,
  Tag,
  ChevronDown,
  ChevronUp,
  Inbox,
  ArrowDownLeft
} from 'lucide-react';
import { CommissionInquiry } from '../../types';
import { useApp } from '../../context/AppContext';
import { ReplyEmailModal } from './ReplyEmailModal';
import { InquiryThreadView } from './InquiryThreadView';
import { fetchEmailServiceStatus, triggerTestEmail, EmailServiceStatus } from '../../utils/emailApi';

interface EmailInquiriesTabProps {
  showToast: (msg: string) => void;
}

export const EmailInquiriesTab: React.FC<EmailInquiriesTabProps> = ({ showToast }) => {
  const {
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    syncInboundResendEmails,
    isFa,
    t,
  } = useApp();

  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'in_review' | 'contacted' | 'completed' | 'archived'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotes, setSelectedNotes] = useState<{ [id: string]: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<CommissionInquiry | null>(null);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailServiceStatus | null>(null);
  const [isSyncingInbound, setIsSyncingInbound] = useState(false);

  // Test Email State
  const [testEmailTarget, setTestEmailTarget] = useState('help.system@ymail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetchEmailServiceStatus().then((status) => {
      setEmailStatus(status);
    });
  }, []);

  const handleSendTestEmail = async () => {
    if (!testEmailTarget.trim()) return;
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await triggerTestEmail(testEmailTarget.trim());
      if (res.success) {
        setTestResult({
          success: true,
          msg: isFa 
            ? `ایمیل تست با موفقیت به ${testEmailTarget} ارسال شد (شناسه: ${res.emailId || 'OK'})`
            : `Test email successfully dispatched to ${testEmailTarget} (ID: ${res.emailId || 'OK'})`
        });
        showToast(isFa ? 'ایمیل تست ارسال شد' : 'Test email dispatched');
      } else {
        setTestResult({
          success: false,
          msg: res.error || (isFa ? 'خطا در ارسال ایمیل تست' : 'Failed to dispatch test email')
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.message || 'Network exception'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSyncInbound = async () => {
    setIsSyncingInbound(true);
    try {
      const res = await syncInboundResendEmails();
      showToast(res.message || (isFa ? 'صندوق ورودی همگام‌سازی شد' : 'Inbound inbox synced'));
    } catch (e: any) {
      showToast(e.message || 'Sync failed');
    } finally {
      setIsSyncingInbound(false);
    }
  };

  // Collect all unique tags across inquiries
  const allUniqueTags = Array.from(
    new Set(
      inquiries.flatMap((inq) => inq.tags || [])
    )
  );

  // Filter & search logic
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesFilter = inquiryFilter === 'all' || inq.status === inquiryFilter;
    if (!matchesFilter) return false;

    if (selectedTagFilter !== 'all') {
      const hasTag = (inq.tags || []).includes(selectedTagFilter);
      if (!hasTag) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.phone && inq.phone.toLowerCase().includes(q)) ||
      (inq.artworkTitle && inq.artworkTitle.toLowerCase().includes(q)) ||
      (inq.interest && inq.interest.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q) ||
      (inq.tags && inq.tags.some((t) => t.toLowerCase().includes(q))) ||
      (inq.adminNotes && inq.adminNotes.toLowerCase().includes(q)) ||
      (inq.messages && inq.messages.some((m) => m.message.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q)))
    );
  });

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    in_review: inquiries.filter((i) => i.status === 'in_review').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    completed: inquiries.filter((i) => i.status === 'completed').length,
    archived: inquiries.filter((i) => i.status === 'archived').length,
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(isFa ? 'متن در حافظه کپی شد' : 'Text copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Resend Service Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono text-white">
                {t.admin.emailServiceTitle}
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                emailStatus?.configured
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {emailStatus?.configured ? t.admin.resendLive : t.admin.resendSimulated}
              </span>
            </div>
            <p className="text-xs text-white/50">
              {t.admin.inquiriesSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-white/70">
            {/* Inbound Sync Button */}
            <button
              type="button"
              onClick={handleSyncInbound}
              disabled={isSyncingInbound}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              title="Poll Resend Inbound Receiving API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInbound ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'همگام‌سازی ورودی Resend' : 'Sync Inbound Resend'}</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/5">
              <span className="text-white/40 block text-[9px] uppercase">{t.admin.resendSender}</span>
              <span className="text-amber-300 truncate max-w-[180px] block">
                {emailStatus?.senderEmail || 'Saghi Abyar Studio <contact@saghiabyar.com>'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Email Dispatcher Tool */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/70 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'تست ارسال ایمیل و راستی‌آزمایی دامنه:' : 'Test Domain Verification & Live Dispatch:'}</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="email"
              value={testEmailTarget}
              onChange={(e) => setTestEmailTarget(e.target.value)}
              placeholder="help.system@ymail.com"
              dir="ltr"
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
            />
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmailTarget.trim()}
              className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {isSendingTest ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <SendHorizontal className="w-3.5 h-3.5" />
              )}
              <span>{isFa ? 'ارسال تست' : 'Send Test'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-2.5 rounded-xl text-xs font-mono border ${
            testResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {testResult.msg}
          </div>
        )}
      </div>

      {/* Filter Chips & Tag Selector & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: isFa ? 'همه پیام‌ها' : 'All Inquiries', count: counts.all },
              { id: 'new', label: t.admin.inquiryNew, count: counts.new, highlight: counts.new > 0 },
              { id: 'in_review', label: t.admin.inquiryReviewed, count: counts.in_review },
              { id: 'contacted', label: t.admin.inquiryContacted, count: counts.contacted },
              { id: 'completed', label: t.admin.inquiryCompleted, count: counts.completed },
              { id: 'archived', label: t.admin.inquiryArchived, count: counts.archived },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setInquiryFilter(st.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  inquiryFilter === st.id
                    ? 'bg-amber-400 text-black font-bold shadow-md'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{st.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  inquiryFilter === st.id
                    ? 'bg-black/20 text-black font-bold'
                    : st.highlight
                    ? 'bg-amber-400/20 text-amber-300 font-bold'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-white/40 ${isFa ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.admin.searchInquiries}
              className={`w-full bg-black/60 border border-white/10 rounded-2xl py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors ${
                isFa ? 'pr-9 pl-3 font-fa' : 'pl-9 pr-3 font-sans'
              }`}
            />
          </div>
        </div>

        {/* Tag Filters Row */}
        {allUniqueTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            <span className="text-white/40 flex items-center gap-1 pl-1">
              <Tag className="w-3 h-3" />
              <span>{isFa ? 'فیلتر برچسب:' : 'Tags:'}</span>
            </span>

            <button
              onClick={() => setSelectedTagFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                selectedTagFilter === 'all'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
              }`}
            >
              {isFa ? 'همه برچسب‌ها' : 'All Tags'}
            </button>

            {allUniqueTags.map((tg) => (
              <button
                key={tg}
                onClick={() => setSelectedTagFilter(tg === selectedTagFilter ? 'all' : tg)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                  selectedTagFilter === tg
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                }`}
              >
                #{tg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="p-12 text-center text-white/40 font-light border border-dashed border-white/10 rounded-3xl space-y-2">
          <Mail className="w-8 h-8 mx-auto text-white/20" />
          <p className="text-sm font-mono">{t.admin.noInquiries}</p>
          {(searchQuery || selectedTagFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTagFilter('all');
              }}
              className="text-xs text-amber-400 underline cursor-pointer"
            >
              {isFa ? 'پاک کردن فیلترها' : 'Clear active filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const hasReplied = Boolean(inq.repliedAt || inq.status === 'contacted');
            const messageCount = (inq.messages?.length) || (inq.replyMessage ? 2 : 1);
            const isThreadExpanded = expandedThreadId === inq.id;

            return (
              <div
                key={inq.id}
                className="p-5 sm:p-6 rounded-3xl bg-zinc-900/70 border border-white/10 space-y-4 relative overflow-hidden transition-all hover:border-white/20"
              >
                {/* Top Row: Name, Date, Status dropdown, Timeline Toggle & Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center font-mono font-bold text-sm flex-shrink-0">
                      {inq.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white font-mono">{inq.name}</h4>
                        {inq.status === 'new' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            NEW
                          </span>
                        )}
                        {hasReplied && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {isFa ? 'پاسخ داده شد' : 'Replied'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-white/40 block mt-0.5">
                        {inq.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
                    {/* Status Dropdown */}
                    <select
                      value={inq.status}
                      onChange={(e) => {
                        updateInquiryStatus(inq.id, e.target.value as CommissionInquiry['status']);
                        showToast(isFa ? 'وضعیت سفارش بروزرسانی شد' : 'Status updated');
                      }}
                      className="bg-black/70 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="new">{t.admin.inquiryNew}</option>
                      <option value="in_review">{t.admin.inquiryReviewed}</option>
                      <option value="contacted">{t.admin.inquiryContacted}</option>
                      <option value="completed">{t.admin.inquiryCompleted}</option>
                      <option value="archived">{t.admin.inquiryArchived}</option>
                    </select>

                    {/* Expand/Collapse Timeline Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedThreadId(isThreadExpanded ? null : inq.id)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors border ${
                        isThreadExpanded
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isFa ? `گفتگو (${messageCount})` : `Timeline (${messageCount})`}</span>
                      {isThreadExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* Direct Reply Button */}
                    <button
                      onClick={() => setReplyTarget(inq)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      title={t.admin.replyBtn}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.admin.replyBtn}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (window.confirm(t.common.confirmDelete)) {
                          deleteInquiry(inq.id);
                          showToast(t.admin.toastDeleted);
                        }
                      }}
                      className="p-2 text-white/40 hover:text-rose-400 transition-colors cursor-pointer rounded-xl bg-white/5 hover:bg-white/10"
                      title={t.admin.inquiryDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags & Email Delivery Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(inq.tags || ['New Inquiry']).map((tg) => (
                      <span
                        key={tg}
                        className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-mono"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.admin.userConfirmationSent}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.admin.adminAlertSent}</span>
                    </span>
                  </div>
                </div>

                {/* Contact Info & Scope Grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                    <span className="text-white/40 font-mono uppercase text-[10px]">Email</span>
                    <p className="font-mono text-white/90 truncate">
                      <a href={`mailto:${inq.email}`} className="text-cyan-300 hover:underline">
                        {inq.email}
                      </a>
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                    <span className="text-white/40 font-mono uppercase text-[10px]">{t.admin.inquiryPhone}</span>
                    <p className="font-mono text-white/90 truncate">
                      {inq.phone ? (
                        <a href={`tel:${inq.phone}`} className="text-emerald-300 hover:underline">
                          {inq.phone}
                        </a>
                      ) : (
                        <span className="text-white/40">{isFa ? 'ثبت نشده' : 'Not provided'}</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                    <span className="text-white/40 font-mono uppercase text-[10px]">{t.admin.inquiryDimensions}</span>
                    <p className="text-white/90 font-mono truncate">{inq.dimensions || (isFa ? 'سفارشی / عمومی' : 'Bespoke')}</p>
                  </div>
                </div>

                {/* Target Piece / Interest Category */}
                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                      {t.admin.inquiryInterest}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {inq.artworkTitle || inq.interest}
                    </p>
                  </div>
                </div>

                {/* Expandable Conversation Timeline Component */}
                {isThreadExpanded ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-400/20">
                    <InquiryThreadView
                      inquiry={inq}
                      showToast={showToast}
                    />
                  </div>
                ) : (
                  /* Collapsed preview of latest message */
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/5 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        {t.admin.inquiryMessage}
                      </span>
                      <button
                        onClick={() => copyToClipboard(inq.message, inq.id)}
                        className="text-[11px] font-mono text-white/50 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === inq.id ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isFa ? 'کپی متن' : 'Copy Text'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed whitespace-pre-wrap font-light">
                      {inq.message}
                    </p>
                  </div>
                )}

                {/* Studio Internal Notes */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">
                    {t.admin.inquiryNotes}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedNotes[inq.id] !== undefined ? selectedNotes[inq.id] : (inq.adminNotes || '')}
                      onChange={(e) => setSelectedNotes({ ...selectedNotes, [inq.id]: e.target.value })}
                      placeholder={isFa ? 'یادداشت داخلی (مثال: تماس گرفته شد، هماهنگی ارسال کاتالوگ...)' : 'Internal notes (e.g. Sent catalogue, client requested video call...)'}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      onClick={() => {
                        const note = selectedNotes[inq.id] !== undefined ? selectedNotes[inq.id] : (inq.adminNotes || '');
                        updateInquiryStatus(inq.id, inq.status, note);
                        showToast(isFa ? 'یادداشت با موفقیت ذخیره شد' : 'Notes saved');
                      }}
                      className="px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-mono cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.common.save}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      <ReplyEmailModal
        inquiry={replyTarget}
        isOpen={Boolean(replyTarget)}
        onClose={() => setReplyTarget(null)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
