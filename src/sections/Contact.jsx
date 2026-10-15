import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { profile } from "../content";

const SERVICE = import.meta.env.VITE_APP_EMAILJS_SERVICE_ID;
const TEMPLATE = import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID;
const KEY = import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const formRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      if (!SERVICE || !TEMPLATE || !KEY) throw new Error("EmailJS keys are not set");
      await emailjs.sendForm(SERVICE, TEMPLATE, formRef.current, { publicKey: KEY });
      formRef.current.reset();
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="section wrap contact">
      <div className="contact-lead">
        <h2>Have a project or a role in mind?</h2>
        <p>
          Tell me what you're building. I reply within a day or two, or write to me directly at{" "}
          <a href={`mailto:${profile.email}`}>{profile.email}</a>.
        </p>
      </div>

      <form ref={formRef} onSubmit={submit} className="form">
        <label>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows="5" required />
        </label>
        <div className="form-foot">
          <button className="btn btn-solid" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending message…" : "Send message"}
          </button>
          <p className={`form-status ${status}`} role="status" aria-live="polite">
            {status === "sent" && "Message sent. I'll get back to you soon."}
            {status === "error" && "The message didn't go through. Check your connection and try again, or use the email link above."}
          </p>
        </div>
      </form>
    </section>
  );
}
