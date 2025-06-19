"use client"

import { useNavigate } from "react-router-dom"
import { useTheme } from "../lib/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Heart, Shield, Star, CheckCircle, Moon, Sun, Monitor } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const handleGetStarted = () => {
    navigate("/auth")
  }

  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  const ThemeToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const themes = ["light", "dark", "system"]
        const currentIndex = themes.indexOf(theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        setTheme(nextTheme)
      }}
    >
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </Button>
  )

  const features = [
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your entries are encrypted and completely private. Only you can access your thoughts.",
    },
    {
      icon: Calendar,
      title: "Daily Reminders",
      description: "Never forget to journal with gentle daily reminders and writing prompts.",
    },
    {
      icon: Heart,
      title: "Mood Tracking",
      description: "Track your emotions and see patterns in your mental wellness journey.",
    },
    {
      icon: BookOpen,
      title: "Rich Editor",
      description: "Beautiful writing experience with formatting, photos, and organization tools.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Writer",
      content: "MyDiary has transformed how I capture my thoughts. The interface is beautiful and intuitive.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Student",
      content: "I love the mood tracking feature. It's helped me understand my emotional patterns better.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Professional",
      content: "The daily reminders keep me consistent with journaling. It's become part of my routine.",
      rating: 5,
    },
  ]

  const benefits = [
    "End-to-end encryption for complete privacy",
    "Beautiful, distraction-free writing environment",
    "Smart mood tracking and analytics",
    "Daily writing prompts and reminders",
    "Cross-device synchronization",
    "Export your data anytime",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">MyDiary</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted}>Get Started</Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            ✨ Your Personal Digital Sanctuary
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Capture Your Life's
            <span className="block text-primary">Beautiful Moments</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your thoughts into lasting memories with our secure, intuitive digital diary. Track your emotions,
            organize your experiences, and discover patterns in your personal journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
              Start Writing Today
            </Button>
            <Button size="lg" variant="outline" onClick={handleLearnMore} className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MyDiary?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make journaling a delightful experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center border-0 bg-card/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits List */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 bg-card/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Everything You Need for Digital Journaling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their journaling journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-card/50">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-base leading-relaxed">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-10 opacity-90 leading-relaxed">
              Join thousands of people who are already documenting their lives with MyDiary.
            </p>
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-3">
              Create Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">MyDiary</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 MyDiary. All rights reserved. Made with ❤️ for journaling enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  )
}
