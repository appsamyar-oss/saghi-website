import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Plus, 
  X, 
  MessageSquare, 
  CornerDownRight, 
  Copy, 
  CheckCheck, 
  ChevronDown, 
  ChevronUp,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  Palette,
  ExternalLink,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { CommissionInquiry, ThreadMessage } from '../../types';
import { useApp } from '../../context/AppContext';

interface InquiryThreadViewProps {
  inquiry: CommissionInquiry;
  onClose?: () => void;
  showToast: (msg: string) => void;
}

const PRESET_TAGS = [
  { name: 'VIP Collector', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { name: 'High Priority', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { name: 'Commission Booked', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { name: 'Price Quote Sent', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { name: 'Exhibition Patron', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { name: 'Follow-up Needed', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { name: 'Tar Soloist Inq', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
];

export const InquiryThreadView: React.FC<InquiryThreadViewProps> = ({
  inquiry,
  showToast,
}) => {
  const {
    replyToInquiry,
    addInquiryTag,
    removeInquiryTag,
    addMessageTag,
    removeMessageTag,
    simulateCollectorReply,
    isFa,
    t,
  } = useApp();

  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const [quickReplySubject, setQuickReplySubject] = useState(
    inquiry.replySubject || `Re: Your Inquiry on ${inquiry.artworkTitle || inquiry.interest || 'Studio Works'}`
  );
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tag input state
  const [newThreadTag, setNewThreadTag] = useState('');
  const [isAddingThreadTag, setIsAddingThreadTag] = useState(false);
  const [activeMessageTagInput, setActiveMessageTagInput] = useState<string | null>(null);
  const [newMessageTag, setNewMessageTag] = useState('');

  // Simulation state
  const [isSimulatingInbound, setIsSimulatingInbound] = useState(false);

  // Derive all chronological messages
  const messages: ThreadMessage[] = Array.isArray(inquiry.messages) && inquiry.messages.length > 0
    ? inquiry.messages
    : [
        {
          id: `msg-orig-${inquiry.id}`,
          senderType: 'user',
          senderName: inquiry.name,
          senderEmail: inquiry.email,
          recipientEmail: 'contact@saghiabyar.com',
          subject: inquiry.interest || inquiry.artworkTitle || 'Initial Studio Inquiry',
          message: inquiry.message,
          createdAt: inquiry.createdAt,
          status: 'received',
          tags: inquiry.tags && inquiry.tags.length > 0 ? inquiry.tags : ['Initial Inquiry'],
        },
        ...(inquiry.replyMessage ? [{
          id: `msg-reply-${inquiry.id}`,
          senderType: 'admin' as const,
          senderName: 'Saghi Abyar Studio',
          senderEmail: 'contact@saghiabyar.com',
          recipientEmail: inquiry.email,
          subject: inquiry.replySubject || 'Re: Studio Inquiry',
          message: inquiry.replyMessage,
          createdAt: inquiry.repliedAt || inquiry.createdAt,
          status: 'sent' as const,
          tags: ['Admin Reply'],
        }] : [])
      ];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await replyToInquiry(inquiry.id, quickReplySubject.trim(), quickReplyText.trim());
      if (res.success) {
        showToast(isFa ? 'پاسخ شما با موفقیت ارسال و به رشته پیام افزوده شد' : 'Reply sent and added to timeline');
        setQuickReplyText('');
        setIsQuickReplyOpen(false);
      } else {
        showToast(res.error || (isFa ? 'خطا در ارسال پاسخ' : 'Failed to send reply'));
      }
    } catch (err: any) {
      showToast(err.message || 'Transmission error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSimulateCollector = async () => {
    setIsSimulatingInbound(true);
    try {
      const res = await simulateCollectorReply(inquiry.id);
      if (res.success) {
        showToast(isFa ? 'پیام بازگشتی متقاضی شبیه‌سازی شد و به گفتگو اضافه گردید' : 'Patron reply simulated & added to thread');
      } else {
        showToast(res.message || 'Simulation error');
      }
    } catch (e: any) {
      showToast(e.message || 'Simulation error');
    } finally {
      setIsSimulatingInbound(false);
    }
  };

  const handleAddThreadTag = (tagToAdd: string) => {
    const tag = tagToAdd.trim();
    if (!tag) return;
    addInquiryTag(inquiry.id, tag);
    setNewThreadTag('');
    setIsAddingThreadTag(false);
    showToast(isFa ? `برچسب «${tag}» اضافه شد` : `Tag "${tag}" added`);
  };

  const handleAddMessageTag = (messageId: string, tagToAdd: string) => {
    const tag = tagToAdd.trim();
    if (!tag) return;
    addMessageTag(inquiry.id, messageId, tag);
    setNewMessageTag('');
    setActiveMessageTagInput(null);
    showToast(isFa ? `برچسب پیام اضافه شد` : `Message tag added`);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(isFa ? 'متن در حافظه کپی شد' : 'Text copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-5" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Thread Tagging & Quick Actions Header */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Thread Tags */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider">
              {isFa ? 'برچسب‌های گفتگو:' : 'Thread Custom Tags:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(inquiry.tags || ['New Inquiry']).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-400/10 text-amber-300 border border-amber-400/30 group"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeInquiryTag(inquiry.id, tag)}
                  className="w-3.5 h-3.5 rounded-full hover:bg-rose-500/20 hover:text-rose-300 flex items-center justify-center cursor-pointer transition-colors text-amber-300/60"
                  title="Remove tag"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {isAddingThreadTag ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newThreadTag}
                  onChange={(e) => setNewThreadTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddThreadTag(newThreadTag);
                    } else if (e.key === 'Escape') {
                      setIsAddingThreadTag(false);
                    }
                  }}
                  placeholder={isFa ? 'نام برچسب...' : 'Tag name...'}
                  autoFocus
                  className="bg-black border border-amber-400/50 rounded-lg px-2 py-0.5 text-xs text-white outline-none font-mono w-28"
                />
                <button
                  type="button"
                  onClick={() => handleAddThreadTag(newThreadTag)}
                  className="p-1 rounded-md bg-amber-400 text-black text-xs cursor-pointer font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingThreadTag(false)}
                  className="p-1 rounded-md bg-white/10 text-white text-xs cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingThreadTag(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-dashed border-white/20 cursor-pointer transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>{isFa ? 'افزودن برچسب' : 'Add Tag'}</span>
              </button>
            )}
          </div>

          {/* Preset Suggested Tags */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] text-white/40 font-mono">{isFa ? 'پیشنهادی:' : 'Presets:'}</span>
            {PRESET_TAGS.map((preset) => {
              const alreadyHas = (inquiry.tags || []).includes(preset.name);
              if (alreadyHas) return null;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddThreadTag(preset.name)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all cursor-pointer opacity-70 hover:opacity-100 ${preset.color}`}
                >
                  + {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {/* Simulate Collector Inbound Reply Button */}
          <button
            type="button"
            onClick={handleSimulateCollector}
            disabled={isSimulatingInbound}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            title="Simulate a customer inbound reply via email webhook"
          >
            {isSimulatingInbound ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
            )}
            <span>{isFa ? 'شبیه‌سازی پاسخ متقاضی' : 'Simulate Patron Reply'}</span>
          </button>

          {/* Toggle Quick Reply Drawer */}
          <button
            type="button"
            onClick={() => setIsQuickReplyOpen(!isQuickReplyOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>{isFa ? 'پاسخ سریع' : 'Quick Reply'}</span>
            {isQuickReplyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Quick Reply Inline Drawer */}
      <AnimatePresence>
        {isQuickReplyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSendReply} className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-amber-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-400/20 text-amber-300">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    {isFa ? 'ارسال پاسخ مستقیم آتلیه به' : 'Direct Atelier Reply to'} {inquiry.name} ({inquiry.email})
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickReplyOpen(false)}
                  className="text-white/40 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Subject</label>
                <input
                  type="text"
                  value={quickReplySubject}
                  onChange={(e) => setQuickReplySubject(e.target.value)}
                  placeholder="Subject line..."
                  required
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Message Body (HTML Letterhead)</label>
                <textarea
                  rows={4}
                  value={quickReplyText}
                  onChange={(e) => setQuickReplyText(e.target.value)}
                  placeholder={isFa ? 'متن پاسخ آتلیه را بنویسید...' : 'Compose your reply to the collector...'}
                  required
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickReplyOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-mono cursor-pointer"
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSendingReply || !quickReplyText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSendingReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isFa ? 'ارسال پاسخ رسمی' : 'Send Official Reply'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat-like Chronological Conversation Timeline */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono text-white/40 pb-1 border-b border-white/10">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFa ? `تاریخچه پیام‌های گفتگو (${messages.length} پیام)` : `Conversation Timeline (${messages.length} messages)`}</span>
        </div>

        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isAdmin = msg.senderType === 'admin';
            const isInitial = index === 0;

            return (
              <div
                key={msg.id || index}
                className={`relative flex flex-col p-4 sm:p-5 rounded-3xl transition-all border ${
                  isAdmin
                    ? 'bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-950 border-amber-400/30 sm:ml-6 ml-2'
                    : 'bg-zinc-900/80 border-white/15 sm:mr-6 mr-2'
                }`}
              >
                {/* Message Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                      isAdmin
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {isAdmin ? <ShieldCheck className="w-5 h-5" /> : msg.senderName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold font-mono text-white">
                          {msg.senderName}
                        </span>
                        
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isAdmin
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold'
                            : 'bg-white/10 text-white/70 border-white/10'
                        }`}>
                          {isAdmin ? (isFa ? 'آتلیه ساقی آبیار (ادمین)' : 'Saghi Abyar Studio') : (isFa ? 'متقاضی / مجموعه‌دار' : 'Patron / Collector')}
                        </span>

                        {isInitial && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {isFa ? 'استعلام اولیه' : 'Original Inquiry'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-white/40 mt-0.5">
                        <span>{msg.senderEmail}</span>
                        <span>•</span>
                        <span>{msg.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Status Badge & Copy */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      msg.status === 'sent'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : msg.status === 'received'
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {msg.status === 'sent' && <ArrowUpRight className="w-3 h-3" />}
                      {msg.status === 'received' && <ArrowDownLeft className="w-3 h-3" />}
                      <span>{msg.status?.toUpperCase() || 'DELIVERED'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.message, msg.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                {msg.subject && (
                  <div className="pt-2.5 pb-1">
                    <span className="text-xs font-mono font-semibold text-white/90">
                      {msg.subject}
                    </span>
                  </div>
                )}

                {/* Message Body */}
                <div className="py-2">
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed whitespace-pre-wrap font-light font-sans">
                    {msg.message}
                  </p>
                </div>

                {/* Message-Level Tags */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <div className="flex flex-wrap items-center gap-1">
                    <Tag className="w-3 h-3 text-white/30" />
                    {(msg.tags || []).map((tVal) => (
                      <span
                        key={tVal}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10 text-[10px]"
                      >
                        <span>{tVal}</span>
                        <button
                          type="button"
                          onClick={() => removeMessageTag(inquiry.id, msg.id, tVal)}
                          className="hover:text-rose-300 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}

                    {activeMessageTagInput === msg.id ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newMessageTag}
                          onChange={(e) => setNewMessageTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMessageTag(msg.id, newMessageTag);
                            } else if (e.key === 'Escape') {
                              setActiveMessageTagInput(null);
                            }
                          }}
                          placeholder="tag..."
                          autoFocus
                          className="bg-black border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-20"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddMessageTag(msg.id, newMessageTag)}
                          className="text-[10px] px-1 py-0.5 bg-amber-400 text-black rounded font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMessageTagInput(msg.id);
                          setNewMessageTag('');
                        }}
                        className="text-[10px] text-white/40 hover:text-white/70 px-1.5 py-0.5 rounded hover:bg-white/5 cursor-pointer"
                      >
                        + tag
                      </button>
                    )}
                  </div>

                  {msg.emailId && (
                    <span className="text-[10px] text-white/30 truncate max-w-[180px]">
                      ID: {msg.emailId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
