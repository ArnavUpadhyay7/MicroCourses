import { Link } from 'react-router-dom';
import { Zap, Users, ShieldCheck, Code } from 'lucide-react';

const Home = () => {
  return (
    // Base: Soft gray background for light mode. Dark: Deep charcoal.
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Hero Section */}
      {/* Light Mode: Subtle Blue/Indigo Gradient on background, Dark Mode: Darker background */}
      <section className="relative overflow-hidden pt-32 pb-40 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        
        {/* Background Gradients/Aura (Subtle in light mode) */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-purple-600/10 rounded-full blur-[180px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Tagline */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-50 dark:bg-gray-800 border border-cyan-600/50 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 backdrop-blur-sm mb-8 transform hover:scale-105 transition-transform duration-300 shadow-sm">
            <Zap className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium tracking-wide">
              MicroCourses — Skill up in 90 days.
            </span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tighter">
            <span className="dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-gray-100 dark:to-cyan-200 text-gray-900">
              Master the Future,
            </span>
            <br />
            {/* Accent Color for "One Course" */}
            <span className="text-cyan-700 dark:text-cyan-400">One Course</span> at a Time.
          </h1>
          
          {/* Subtext */}
          <p className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-400 max-w-4xl mx-auto font-light">
            Access expert-led nano-degrees, peer-to-peer code reviews, and guaranteed
            career-focused content. Stop consuming, start creating.
          </p>
          
          {/* Primary Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
            <Link
              to="/courses"
              // Light Mode: Cyan-600 with deeper hover and shadow
              className="bg-cyan-600 dark:bg-cyan-500 text-white dark:text-gray-900 px-10 py-4 rounded-xl text-xl font-bold hover:bg-cyan-700 dark:hover:bg-cyan-400 hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-cyan-300/60 dark:shadow-cyan-500/30"
            >
              Start Learning Now
            </Link>
            <Link
              to="/register"
              // Light Mode: Border-gray-400, Text-gray-700, hover effect
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-10 py-4 rounded-xl text-xl font-semibold hover:bg-gray-100 hover:border-cyan-600 hover:text-cyan-600 dark:hover:bg-gray-800 dark:hover:border-cyan-500 dark:hover:text-cyan-400 transition-all duration-300"
            >
              Create your free account
            </Link>
          </div>

          {/* Key Metrics/Social Proof */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto border-t border-b border-gray-200 dark:border-gray-800 py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">10K+</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">98%</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">Job Placement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">50+</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">Nano-Degrees</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">4.9/5</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Grid with Accent */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-2">
              The MicroCourses Edge
            </h2>
            <p className="text-5xl font-extrabold text-gray-900 dark:text-white">
              Built for Today's Learners
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            
            {/* Feature Card 1 */}
            <div className="group p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-100/50 dark:hover:shadow-2xl dark:hover:shadow-cyan-500/10 transform hover:-translate-y-1">
              <div className="bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Project-Based Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Skip the lectures. Our curriculum is 80% hands-on projects, labs, and real-world coding challenges.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-100/50 dark:hover:shadow-2xl dark:hover:shadow-cyan-500/10 transform hover:-translate-y-1">
              <div className="bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Peer & Expert Review
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Get constructive feedback on your code and projects from your peers and professional developers.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-100/50 dark:hover:shadow-2xl dark:hover:shadow-cyan-500/10 transform hover:-translate-y-1">
              <div className="bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Verified Certificates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Earn credentials that are recognized by top tech employers and ready for your LinkedIn profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Final Push */}
      <section className="relative bg-gray-100 dark:bg-gray-800 py-32 border-t border-gray-200 dark:border-gray-700">
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Stop Scrolling. Start Building.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your career goals are within reach. Join the platform that measures success in deployed code, not hours watched.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              // Primary CTA with strong color gradient and shadow
              className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-500 dark:to-teal-500 text-white dark:text-gray-900 px-12 py-4 rounded-xl text-xl font-bold hover:from-cyan-700 hover:to-teal-700 dark:hover:from-cyan-400 dark:hover:to-teal-400 hover:scale-105 transition-all duration-300 shadow-xl shadow-cyan-300/60 dark:shadow-cyan-500/30"
            >
              Enroll for Free
            </Link>
            <Link
              to="/creator/apply"
              // Secondary CTA with border hover effect
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-12 py-4 rounded-xl text-xl font-semibold hover:bg-gray-200 hover:border-cyan-600 hover:text-cyan-600 dark:hover:bg-gray-700 dark:hover:border-cyan-500 dark:hover:text-cyan-400 transition-all duration-300"
            >
              Teach a Course
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;