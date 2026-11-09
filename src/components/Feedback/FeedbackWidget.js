import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FEEDBACK_TYPES, sendFeedback } from './feedbackConfig';
import './FeedbackWidget.scss';

const MAX_LENGTH = 2000;

function FeedbackWidget() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState(FEEDBACK_TYPES[0].id);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [botcheck, setBotcheck] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | sending | sent | error
    const [error, setError] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        if (textareaRef.current) textareaRef.current.focus();

        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const reset = () => {
        setType(FEEDBACK_TYPES[0].id);
        setMessage("");
        setEmail("");
        setStatus("idle");
        setError("");
    };

    const toggle = () => {
        if (open && status === "sent") reset();
        setOpen(!open);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || status === "sending") return;

        setStatus("sending");
        setError("");
        sendFeedback({
            type,
            message: message.trim(),
            email: email.trim(),
            page: window.location.origin + window.location.pathname + "#" + location.pathname,
            botcheck,
        })
            .then(() => setStatus("sent"))
            .catch((err) => {
                setStatus("error");
                setError((err.message || "Sending failed").replace(/\.+$/, ""));
            });
    };

    return (
        <div className="FeedbackWidget-root">
            {open &&
                <div className="FeedbackWidget-panel" role="dialog" aria-label="Send feedback">
                    <div className="FeedbackWidget-header">
                        <span>Feedback</span>
                        <button type="button" className="FeedbackWidget-close" onClick={toggle} aria-label="Close">
                            <span className="material-icons">close</span>
                        </button>
                    </div>

                    {status === "sent" ?
                        <div className="FeedbackWidget-success">
                            <span className="material-icons">check_circle</span>
                            <p>Thanks for your feedback!</p>
                            <button type="button" className="FeedbackWidget-submit" onClick={reset}>Send more</button>
                        </div>
                        :
                        <form onSubmit={onSubmit}>
                            <div className="FeedbackWidget-types">
                                {FEEDBACK_TYPES.map(t =>
                                    <button type="button" key={t.id}
                                        className={"FeedbackWidget-type" + (type === t.id ? " active" : "")}
                                        onClick={() => setType(t.id)}>
                                        <span className="material-icons">{t.icon}</span>
                                        {t.label}
                                    </button>
                                )}
                            </div>

                            <textarea ref={textareaRef} required maxLength={MAX_LENGTH}
                                placeholder={type === "data"
                                    ? "What is wrong? E.g. missing weapon, wrong value…"
                                    : "Tell us what's on your mind…"}
                                value={message} onChange={e => setMessage(e.target.value)} />

                            <input type="email" placeholder="E-mail (optional, for replies)"
                                value={email} onChange={e => setEmail(e.target.value)} />

                            {/* Honeypot: hidden from humans, bots tend to fill it in */}
                            <input type="checkbox" name="botcheck" className="FeedbackWidget-botcheck"
                                tabIndex={-1} autoComplete="off" aria-hidden="true"
                                checked={botcheck} onChange={e => setBotcheck(e.target.checked)} />

                            <div className="FeedbackWidget-page">
                                Page: <code>#{location.pathname}</code>
                            </div>

                            {status === "error" &&
                                <div className="FeedbackWidget-error">{error}. Please try again.</div>}

                            <button type="submit" className="FeedbackWidget-submit"
                                disabled={!message.trim() || status === "sending"}>
                                {status === "sending" ? "Sending…" : "Send"}
                            </button>
                        </form>
                    }
                </div>
            }

            <button type="button" className={"FeedbackWidget-fab" + (open ? " open" : "")}
                onClick={toggle} aria-label={open ? "Close feedback" : "Send feedback"} aria-expanded={open}>
                <span className="material-icons">{open ? "close" : "feedback"}</span>
            </button>
        </div>
    );
}

export default FeedbackWidget;
