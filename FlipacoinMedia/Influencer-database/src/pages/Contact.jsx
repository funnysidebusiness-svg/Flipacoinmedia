import { useState } from "react";
import emailjs from "emailjs-com";
import "../styles.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: ""
  });
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_8aaclln", // Replace with your EmailJS Service ID
        "template_ordt01b", // Replace with your EmailJS Template ID
        formData,
        "MM3_jxLHSqxjsz-oo" // Replace with your EmailJS Public Key
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setShowPopup(true); // ✅ show popup after success
          setFormData({ name: "", email: "", number:"", message: "" }); // clear form
          setTimeout(() => setShowPopup(false), 4000); // hide after 4 sec
        },
        (error) => {
          console.log("FAILED...", error);
          alert("Something went wrong. Please try again.");
        }
      );
  };

  return (
    <div className="contact-container">
      <h1 className="page-titleabout">Contact Us</h1>
      <p className="statsabout">
        Have a question or want to work with us? Fill out the form below and we’ll get back to you soon.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="number"
          placeholder="Your Contact Number"
          value={formData.number}
          onChange={handleChange}
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit">Send Message</button>
      </form>

      {showPopup && (
        <div className="thankyou-popup">
          <div className="popup-content">
            <h2>🎉 Thank You!</h2>
            <p>We have received your data. We will contact you soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}
