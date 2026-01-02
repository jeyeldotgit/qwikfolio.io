import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const ContactSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text */}
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
              GET IN TOUCH
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Have Questions?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We're here to help you build the perfect portfolio. Send us a message
              and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400">📧</span>
                </div>
                <span>hello@qwikfolio.io</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400">💬</span>
                </div>
                <span>Usually responds within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-xl" />
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-lg">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 mb-4">
                    <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Thanks for reaching out. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help..."
                      required
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

