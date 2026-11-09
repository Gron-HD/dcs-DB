// Feedback is sent to Web3Forms (https://web3forms.com), which forwards it by e-mail.
// The access key is meant to be public: it can only send mail to the address it was created for.
// To switch to another backend later (e.g. a Cloudflare Worker), change ENDPOINT and the
// payload built in sendFeedback() below – the widget itself does not need to change.

export const WEB3FORMS_ACCESS_KEY = "9d4d73b9-f590-45c4-b93b-cd6dbd6d746c";

const ENDPOINT = "https://api.web3forms.com/submit";

export const FEEDBACK_TYPES = [
    { id: "data", label: "Wrong data", icon: "fact_check" },
    { id: "bug", label: "Bug", icon: "bug_report" },
    { id: "idea", label: "Idea", icon: "lightbulb" },
];

export function sendFeedback({ type, message, email, page, botcheck })
{
    const typeLabel = (FEEDBACK_TYPES.find(t => t.id === type) || {}).label || type;

    return fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `DCSDB Feedback: ${typeLabel}`,
            from_name: "DCSDB Feedback",
            type: typeLabel,
            page: page,
            message: message,
            email: email || undefined,
            botcheck: botcheck,
        }),
    })
        .then(res => res.json().catch(() => ({})).then(body => {
            if (!res.ok || !body.success)
            {
                throw new Error(body.message || "Sending failed");
            }
            return body;
        }));
}
