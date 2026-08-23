import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, User, CheckCircle2, AlertCircle, Sparkles, FileText, CornerDownRight } from 'lucide-react';
import { CommissionInquiry } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReplyEmailModalProps {
  inquiry: CommissionInquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ReplyEmailModal: React.FC<ReplyEmailModalProps> = ({
  inquiry,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isFa, t, replyToInquiry } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form when inquiry changes
  React.useEffect(() => {
    if (inquiry) {
      const defaultSubject = isFa
        ? `پاسخ به استعلام شما در آتلیه ساقی آبیار [${inquiry.artworkTitle || inquiry.interest}]`
        : `Re: Your Inquiry with Saghi Abyar Fine Art Studio [Ref: ${inquiry.artworkTitle || inquiry.interest}]`;

      const defaultBody = isFa
        ? `با درود و احترام خدمت ${inquiry.name} گرامی،\n\nاز ابراز لطف و پیام ارزشمند شما برای آتلیه ساقی آبیار بسیار سپاسگزاریم. در خصوص درخواست شما پیرامون «${inquiry.artworkTitle || inquiry.interest}»،\n\n\n\nبا احترام فراوان،\nساقی آبیار\nآتلیه نقاشی و تکنوازی تار`
        : `Dear ${inquiry.name},\n\nThank you for reaching out to Saghi Abyar Fine Art Studio. Regarding your inquiry on "${inquiry.artworkTitle || inquiry.interest}",\n\n\n\nWarm regards,\nSaghi Abyar\nFine Art Painter & Tar Soloist`;

      setSubject(defaultSubject);
      setMessage(defaultBody);
      setErrorMsg(null);
    }
  }, [inquiry, isFa]);

  if (!isOpen || !inquiry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg(isFa ? 'لطفاً عنوان و متن پاسخ را وارد نمایید' : 'Please fill in both subject and message');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    try {
      const res = await replyToInquiry(inquiry.id, subject.trim(), message.trim());
      if (res.success) {
        onSuccess(t.admin.replySuccess);
        onClose();
      } else {
        setErrorMsg(res.error || t.admin.replyError);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Transmission error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-zinc-950 border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden text-white my-auto flex flex-col"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white">
                  {t.admin.replyModalTitle}
                </h3>
                <p className="text-xs text-white/50">
                  {isFa ? 'ارسال پاسخ رسمی مستقیم از آتلیه ساقی آبیار به ایمیل متقاضی' : 'Send official atelier response directly to client'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSending}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Recipient Details */}
            <div className="grid sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-white/50">{t.admin.replyToLabel}:</span>
                <span className="font-semibold text-white truncate">{inquiry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-white/50">Email:</span>
                <span className="font-mono text-cyan-300 truncate">{inquiry.email}</span>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-white/70 uppercase tracking-wide flex items-center justify-between">
                <span>{t.admin.replySubjectLabel} *</span>
                <span className="text-[10px] text-amber-400/80 font-normal">Resend API Header</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line..."
                required
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-amber-400 transition-colors font-mono"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-white/70 uppercase tracking-wide flex items-center justify-between">
                <span>{t.admin.replyMessageLabel} *</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">HTML Atelier Letterhead</span>
              </label>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your response to the collector here..."
                required
                className="w-full bg-black/60 border border-white/15 rounded-2xl p-4 text-xs sm:text-sm text-white leading-relaxed outline-none focus:border-amber-400 transition-colors font-sans"
              />
            </div>

            {/* Original Inquiry Reference */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-mono">
                <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'متن پیام اولیه مشتری جهت ارجاع:' : 'Original collector inquiry message reference:'}</span>
              </div>
              <p className="text-white/70 font-light italic line-clamp-3 text-[11px] border-l-2 border-white/10 pl-2">
                "{inquiry.message}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-5 py-2.5 rounded-full text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span>{t.admin.replySending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.admin.replySendBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
