"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Heart, Brain, Leaf, Sun, Moon, Droplets } from 'lucide-react';

interface WellnessTip {
  id: number;
  title: string;
  description: string;
  category: 'mental' | 'physical' | 'nutrition' | 'sleep' | 'mindfulness' | 'social' | 'spiritual';
  icon: string;
}

const wellnessTips: WellnessTip[] = [
  // Mental Health Tips (15 tips)
  { id: 1, title: "Practice Deep Breathing", description: "Take 5 deep breaths whenever you feel stressed. Inhale for 4 counts, hold for 4, exhale for 4.", category: "mental", icon: "🫁" },
  { id: 2, title: "Start a Gratitude Journal", description: "Write down 3 things you're grateful for each morning to boost positive thinking.", category: "mental", icon: "📝" },
  { id: 3, title: "Practice the 5-4-3-2-1 Technique", description: "When anxious, identify 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.", category: "mental", icon: "👁️" },
  { id: 4, title: "Take Mental Health Breaks", description: "Step away from work every 90 minutes for a 10-15 minute mental reset.", category: "mental", icon: "⏰" },
  { id: 5, title: "Practice Positive Self-Talk", description: "Replace negative thoughts with encouraging ones. Treat yourself like your best friend.", category: "mental", icon: "💭" },
  { id: 6, title: "Set Boundaries", description: "Learn to say 'no' to commitments that drain your energy or compromise your well-being.", category: "mental", icon: "🚧" },
  { id: 7, title: "Practice Mindful Listening", description: "When talking to others, focus completely on their words without planning your response.", category: "mental", icon: "👂" },
  { id: 8, title: "Create a Worry Window", description: "Designate 15 minutes daily to worry, then redirect anxious thoughts to this time slot.", category: "mental", icon: "🪟" },
  { id: 9, title: "Practice Progressive Muscle Relaxation", description: "Tense and release each muscle group for 5 seconds to reduce physical stress.", category: "mental", icon: "💪" },
  { id: 10, title: "Use the STOP Technique", description: "Stop, Take a breath, Observe your thoughts/feelings, Proceed mindfully.", category: "mental", icon: "🛑" },
  { id: 11, title: "Practice Emotional Labeling", description: "Name your emotions specifically: 'I feel frustrated' instead of 'I feel bad'.", category: "mental", icon: "🏷️" },
  { id: 12, title: "Create a Calm Space", description: "Designate a corner of your home as a peaceful retreat with calming colors and objects.", category: "mental", icon: "🏠" },
  { id: 13, title: "Practice the 2-Minute Rule", description: "If something takes less than 2 minutes, do it now to prevent mental clutter.", category: "mental", icon: "⏱️" },
  { id: 14, title: "Use Affirmations", description: "Start your day with positive affirmations: 'I am capable, worthy, and strong'.", category: "mental", icon: "✨" },
  { id: 15, title: "Practice Mental Decluttering", description: "Write down racing thoughts to clear mental space and gain perspective.", category: "mental", icon: "🧹" },

  // Physical Health Tips (15 tips)
  { id: 16, title: "Take the Stairs", description: "Choose stairs over elevators to add extra movement to your day naturally.", category: "physical", icon: "🪜" },
  { id: 17, title: "Do Desk Stretches", description: "Stretch your neck, shoulders, and wrists every hour during work to prevent stiffness.", category: "physical", icon: "🤸" },
  { id: 18, title: "Walk After Meals", description: "Take a 10-15 minute walk after eating to aid digestion and boost energy.", category: "physical", icon: "🚶" },
  { id: 19, title: "Practice Good Posture", description: "Keep your shoulders back, core engaged, and head aligned over your spine.", category: "physical", icon: "🕴️" },
  { id: 20, title: "Do Bodyweight Exercises", description: "Incorporate push-ups, squats, or planks during TV commercial breaks.", category: "physical", icon: "🏋️" },
  { id: 21, title: "Take Movement Breaks", description: "Set a timer to move for 2 minutes every 30 minutes of sitting.", category: "physical", icon: "⏲️" },
  { id: 22, title: "Practice Balance Exercises", description: "Stand on one foot while brushing teeth or doing dishes to improve stability.", category: "physical", icon: "⚖️" },
  { id: 23, title: "Use a Standing Desk", description: "Alternate between sitting and standing throughout your workday.", category: "physical", icon: "🖥️" },
  { id: 24, title: "Do Morning Stretches", description: "Start your day with 5 minutes of gentle stretching to wake up your body.", category: "physical", icon: "🧘" },
  { id: 25, title: "Take Cold Showers", description: "End your shower with 30 seconds of cold water to boost circulation and energy.", category: "physical", icon: "🚿" },
  { id: 26, title: "Practice Deep Squats", description: "Hold a deep squat for 30 seconds to improve hip mobility and leg strength.", category: "physical", icon: "🦵" },
  { id: 27, title: "Do Wall Push-ups", description: "If regular push-ups are challenging, start with wall push-ups to build strength.", category: "physical", icon: "🧱" },
  { id: 28, title: "Strengthen Your Core", description: "Hold a plank for 30 seconds daily, gradually increasing duration.", category: "physical", icon: "💪" },
  { id: 29, title: "Practice Breathing Exercises", description: "Do diaphragmatic breathing to strengthen respiratory muscles and reduce stress.", category: "physical", icon: "🫁" },
  { id: 30, title: "Incorporate Yoga", description: "Do 10 minutes of yoga daily to improve flexibility, strength, and mindfulness.", category: "physical", icon: "🧘‍♀️" },

  // Nutrition Tips (15 tips)
  { id: 31, title: "Drink Water First Thing", description: "Start your day with a glass of water to kickstart hydration and metabolism.", category: "nutrition", icon: "💧" },
  { id: 32, title: "Eat the Rainbow", description: "Include colorful fruits and vegetables in every meal for diverse nutrients.", category: "nutrition", icon: "🌈" },
  { id: 33, title: "Practice Mindful Eating", description: "Chew slowly and pay attention to taste, texture, and hunger cues.", category: "nutrition", icon: "🍽️" },
  { id: 34, title: "Prepare Healthy Snacks", description: "Keep nuts, fruits, or vegetables ready for when hunger strikes.", category: "nutrition", icon: "🥜" },
  { id: 35, title: "Read Food Labels", description: "Check ingredients and nutritional information to make informed choices.", category: "nutrition", icon: "🏷️" },
  { id: 36, title: "Cook at Home More", description: "Prepare meals at home to control ingredients and portion sizes.", category: "nutrition", icon: "👨‍🍳" },
  { id: 37, title: "Limit Processed Foods", description: "Choose whole, unprocessed foods whenever possible for better nutrition.", category: "nutrition", icon: "🚫" },
  { id: 38, title: "Practice Portion Control", description: "Use smaller plates and listen to your body's fullness signals.", category: "nutrition", icon: "🍽️" },
  { id: 39, title: "Include Protein in Every Meal", description: "Add lean protein to maintain muscle mass and feel satisfied longer.", category: "nutrition", icon: "🥩" },
  { id: 40, title: "Stay Hydrated", description: "Drink water throughout the day; aim for 8 glasses or more based on activity.", category: "nutrition", icon: "🚰" },
  { id: 41, title: "Limit Added Sugars", description: "Reduce consumption of sugary drinks, desserts, and processed snacks.", category: "nutrition", icon: "🍭" },
  { id: 42, title: "Eat More Fiber", description: "Include beans, whole grains, and vegetables to support digestive health.", category: "nutrition", icon: "🌾" },
  { id: 43, title: "Plan Your Meals", description: "Spend time weekly planning nutritious meals to avoid unhealthy last-minute choices.", category: "nutrition", icon: "📅" },
  { id: 44, title: "Don't Skip Breakfast", description: "Start your day with a balanced meal to fuel your body and brain.", category: "nutrition", icon: "🍳" },
  { id: 45, title: "Practice Intuitive Eating", description: "Listen to your body's hunger and fullness cues rather than external diet rules.", category: "nutrition", icon: "🎯" },

  // Sleep Tips (15 tips)
  { id: 46, title: "Create a Sleep Schedule", description: "Go to bed and wake up at the same time daily, even on weekends.", category: "sleep", icon: "⏰" },
  { id: 47, title: "Create a Bedtime Routine", description: "Develop calming pre-sleep activities like reading or gentle stretching.", category: "sleep", icon: "📖" },
  { id: 48, title: "Limit Screen Time Before Bed", description: "Turn off devices 1 hour before sleep to improve sleep quality.", category: "sleep", icon: "📱" },
  { id: 49, title: "Keep Your Bedroom Cool", description: "Maintain bedroom temperature between 60-67°F for optimal sleep.", category: "sleep", icon: "🌡️" },
  { id: 50, title: "Use Blackout Curtains", description: "Block outside light to maintain your natural sleep-wake cycle.", category: "sleep", icon: "🏠" },
  { id: 51, title: "Avoid Caffeine Late in Day", description: "Stop caffeine consumption 6 hours before bedtime to prevent sleep disruption.", category: "sleep", icon: "☕" },
  { id: 52, title: "Try the 4-7-8 Breathing", description: "Inhale for 4, hold for 7, exhale for 8 to promote relaxation before sleep.", category: "sleep", icon: "🫁" },
  { id: 53, title: "Keep a Sleep Diary", description: "Track sleep patterns to identify what helps or hinders your rest.", category: "sleep", icon: "📝" },
  { id: 54, title: "Use White Noise", description: "Block disruptive sounds with a white noise machine or app.", category: "sleep", icon: "🔊" },
  { id: 55, title: "Exercise Regularly", description: "Regular physical activity improves sleep quality, but avoid intense exercise before bed.", category: "sleep", icon: "🏃" },
  { id: 56, title: "Practice Progressive Relaxation", description: "Tense and release muscle groups systematically to prepare for sleep.", category: "sleep", icon: "😌" },
  { id: 57, title: "Limit Naps", description: "If you nap, keep it under 30 minutes and before 3 PM.", category: "sleep", icon: "😴" },
  { id: 58, title: "Create a Worry Journal", description: "Write down concerns before bed to clear your mind for sleep.", category: "sleep", icon: "📓" },
  { id: 59, title: "Use Aromatherapy", description: "Try lavender essential oil or chamomile tea to promote relaxation.", category: "sleep", icon: "🌸" },
  { id: 60, title: "Get Morning Sunlight", description: "Expose yourself to natural light within an hour of waking to regulate circadian rhythm.", category: "sleep", icon: "☀️" },

  // Mindfulness Tips (15 tips)
  { id: 61, title: "Practice 5-Minute Meditation", description: "Start with just 5 minutes of focused breathing or guided meditation daily.", category: "mindfulness", icon: "🧘" },
  { id: 62, title: "Do Body Scan Meditation", description: "Focus attention on different body parts to increase body awareness and relaxation.", category: "mindfulness", icon: "🔍" },
  { id: 63, title: "Practice Mindful Walking", description: "Pay attention to each step, the ground beneath your feet, and your surroundings.", category: "mindfulness", icon: "👣" },
  { id: 64, title: "Use Mindful Breathing", description: "Focus on your breath for 2 minutes whenever you feel overwhelmed or distracted.", category: "mindfulness", icon: "🌬️" },
  { id: 65, title: "Practice Loving-Kindness", description: "Send good wishes to yourself, loved ones, and even difficult people.", category: "mindfulness", icon: "💝" },
  { id: 66, title: "Do Single-Tasking", description: "Focus on one activity at a time instead of multitasking for better concentration.", category: "mindfulness", icon: "🎯" },
  { id: 67, title: "Practice Mindful Eating", description: "Pay attention to flavors, textures, and sensations while eating.", category: "mindfulness", icon: "🍎" },
  { id: 68, title: "Use Mindful Technology", description: "Before checking your phone, pause and set an intention for how you'll use it.", category: "mindfulness", icon: "📱" },
  { id: 69, title: "Practice Acceptance", description: "Acknowledge difficult emotions without trying to change them immediately.", category: "mindfulness", icon: "🤝" },
  { id: 70, title: "Do Mindful Observation", description: "Spend 5 minutes observing nature, art, or any object with full attention.", category: "mindfulness", icon: "👀" },
  { id: 71, title: "Practice Present Moment Awareness", description: "Regularly ask yourself: 'What am I thinking and feeling right now?'", category: "mindfulness", icon: "⏰" },
  { id: 72, title: "Use Mindful Transitions", description: "Take three conscious breaths when moving between activities or locations.", category: "mindfulness", icon: "🔄" },
  { id: 73, title: "Practice Mindful Communication", description: "Listen fully without planning your response; speak with intention.", category: "mindfulness", icon: "💬" },
  { id: 74, title: "Do Mindful Chores", description: "Turn routine tasks into meditation by focusing fully on the activity.", category: "mindfulness", icon: "🧽" },
  { id: 75, title: "Practice Non-Judgmental Awareness", description: "Notice your thoughts and feelings without labeling them as good or bad.", category: "mindfulness", icon: "⚖️" },

  // Social Tips (10 tips)
  { id: 76, title: "Schedule Regular Check-ins", description: "Set up weekly calls or meetings with friends and family to maintain connections.", category: "social", icon: "📞" },
  { id: 77, title: "Practice Active Listening", description: "Give your full attention when others speak, ask questions, show genuine interest.", category: "social", icon: "👂" },
  { id: 78, title: "Express Gratitude to Others", description: "Tell people specifically how they've helped or inspired you.", category: "social", icon: "🙏" },
  { id: 79, title: "Join Community Groups", description: "Participate in local clubs, volunteer organizations, or hobby groups.", category: "social", icon: "👥" },
  { id: 80, title: "Practice Empathy", description: "Try to understand others' perspectives before responding or judging.", category: "social", icon: "❤️" },
  { id: 81, title: "Set Social Boundaries", description: "Communicate your needs clearly and respect others' boundaries too.", category: "social", icon: "🚧" },
  { id: 82, title: "Practice Forgiveness", description: "Let go of grudges for your own peace; forgiveness doesn't mean forgetting.", category: "social", icon: "🕊️" },
  { id: 83, title: "Share Your Vulnerabilities", description: "Open up about struggles with trusted friends to deepen relationships.", category: "social", icon: "💭" },
  { id: 84, title: "Celebrate Others' Successes", description: "Genuinely congratulate others on their achievements without comparison.", category: "social", icon: "🎉" },
  { id: 85, title: "Practice Random Acts of Kindness", description: "Do small, unexpected nice things for others without expecting anything back.", category: "social", icon: "💕" },

  // Spiritual/Purpose Tips (15 tips)
  { id: 86, title: "Connect with Nature", description: "Spend time outdoors daily, even if just for a few minutes in your yard.", category: "spiritual", icon: "🌳" },
  { id: 87, title: "Practice Daily Reflection", description: "Spend 10 minutes each evening reflecting on your day and lessons learned.", category: "spiritual", icon: "🤔" },
  { id: 88, title: "Identify Your Core Values", description: "List 5 values that matter most to you and align your actions with them.", category: "spiritual", icon: "⭐" },
  { id: 89, title: "Find Your Purpose", description: "Reflect on what gives your life meaning and how you can serve others.", category: "spiritual", icon: "🎯" },
  { id: 90, title: "Practice Compassion", description: "Extend kindness to yourself and others, especially during difficult times.", category: "spiritual", icon: "🤲" },
  { id: 91, title: "Create Meaningful Rituals", description: "Develop personal ceremonies that connect you to what's important.", category: "spiritual", icon: "🕯️" },
  { id: 92, title: "Practice Surrender", description: "Accept what you cannot control and focus energy on what you can influence.", category: "spiritual", icon: "🙌" },
  { id: 93, title: "Seek Wisdom", description: "Read books, listen to podcasts, or talk to mentors who inspire growth.", category: "spiritual", icon: "📚" },
  { id: 94, title: "Practice Service", description: "Volunteer or help others in ways that align with your values and abilities.", category: "spiritual", icon: "🤝" },
  { id: 95, title: "Connect to Something Greater", description: "Whether through religion, spirituality, or philosophy, connect to larger meaning.", category: "spiritual", icon: "🌌" },
  { id: 96, title: "Practice Humility", description: "Stay open to learning and acknowledge that you don't have all the answers.", category: "spiritual", icon: "🎓" },
  { id: 97, title: "Cultivate Wonder", description: "Approach life with curiosity and appreciation for small miracles around you.", category: "spiritual", icon: "✨" },
  { id: 98, title: "Live Authentically", description: "Be true to yourself rather than conforming to others' expectations.", category: "spiritual", icon: "🎭" },
  { id: 99, title: "Practice Presence", description: "Fully engage with whatever you're doing instead of rushing to the next thing.", category: "spiritual", icon: "🎁" },
  { id: 100, title: "Embrace Growth", description: "View challenges as opportunities to learn and become a better version of yourself.", category: "spiritual", icon: "🌱" }
];

const categoryColors = {
  mental: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]',
  physical: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]',
  nutrition: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]',
  sleep: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]',
  mindfulness: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]',
  social: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]',
  spiritual: 'bg-[#F5F7F5] text-[#2D3E2D] border-[#C8D8C8]'
};

const categoryIcons = {
  mental: Brain,
  physical: Heart,
  nutrition: Leaf,
  sleep: Moon,
  mindfulness: Sun,
  social: Sparkles,
  spiritual: Droplets
};

export default function DailyWellnessTips() {
  const [currentTip, setCurrentTip] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const filteredTips = selectedCategory === 'all' 
    ? wellnessTips 
    : wellnessTips.filter(tip => tip.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'All Tips', icon: Sparkles },
    { key: 'mental', label: 'Mental Health', icon: Brain },
    { key: 'physical', label: 'Physical Health', icon: Heart },
    { key: 'nutrition', label: 'Nutrition', icon: Leaf },
    { key: 'sleep', label: 'Sleep', icon: Moon },
    { key: 'mindfulness', label: 'Mindfulness', icon: Sun },
    { key: 'social', label: 'Social', icon: Sparkles },
    { key: 'spiritual', label: 'Spiritual', icon: Droplets }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % filteredTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredTips.length, isAutoPlaying]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % filteredTips.length);
    setIsAutoPlaying(false);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
    setIsAutoPlaying(false);
  };

  const getCurrentTip = () => filteredTips[currentTip] || wellnessTips[0];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentTip(0);
    setIsAutoPlaying(true);
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#7A9B7A] mr-2" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#2D3E2D]">
              Daily Wellness Tips
            </h2>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#7A9B7A] ml-2" />
          </div>
          <p className="text-base sm:text-lg text-[#4A5F4A] max-w-3xl mx-auto">
            Discover 100 evidence-based wellness tips to transform your daily routine. 
            Small changes lead to big improvements in your mental, physical, and spiritual well-being.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => handleCategoryChange(category.key)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-light transition-all duration-200 ${
                  selectedCategory === category.key
                    ? 'bg-[#2D3E2D] text-white shadow-lg transform scale-105'
                    : 'bg-white border border-[#C8D8C8] text-[#4A5F4A] hover:bg-[#F5F7F5] hover:text-[#2D3E2D] shadow-sm'
                }`}
              >
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tip Display */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevTip}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#4A5F4A] hover:text-[#2D3E2D] p-2 sm:p-3 rounded-full border border-[#C8D8C8] shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextTip}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#4A5F4A] hover:text-[#2D3E2D] p-2 sm:p-3 rounded-full border border-[#C8D8C8] shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next tip"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Tip Card */}
          <div className="bg-[#F5F7F5] border border-[#C8D8C8] rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 mx-4 sm:mx-8 lg:mx-12">
            <div className="text-center">
              {/* Tip Number and Category */}
              <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl lg:text-6xl">{getCurrentTip().icon}</span>
                <div className="text-left">
                  <div className="text-xs sm:text-sm text-[#4A5F4A] font-light">
                    Tip #{getCurrentTip().id} of 100
                  </div>
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-light border ${
                    categoryColors[getCurrentTip().category as keyof typeof categoryColors]
                  }`}>
                    {getCurrentTip().category.charAt(0).toUpperCase() + getCurrentTip().category.slice(1)}
                  </span>
                </div>
              </div>

              {/* Tip Title */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-normal text-[#2D3E2D] mb-4 sm:mb-6">
                {getCurrentTip().title}
              </h3>

              {/* Tip Description */}
              <p className="text-base sm:text-lg text-[#4A5F4A] leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8">
                {getCurrentTip().description}
              </p>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                {filteredTips.slice(Math.max(0, currentTip - 2), currentTip + 3).map((_, index) => {
                  const realIndex = Math.max(0, currentTip - 2) + index;
                  return (
                    <button
                      key={realIndex}
                      onClick={() => {
                        setCurrentTip(realIndex);
                        setIsAutoPlaying(false);
                      }}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                        realIndex === currentTip
                          ? 'bg-[#2D3E2D] w-6 sm:w-8'
                          : 'bg-[#C8D8C8] hover:bg-[#9DB99D]'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Auto-play Toggle */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`text-xs sm:text-sm font-light px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-200 ${
                  isAutoPlaying
                    ? 'bg-[#D4E4D4] text-[#2D3E2D] hover:bg-[#9DB99D]'
                    : 'bg-[#F5F7F5] border border-[#C8D8C8] text-[#4A5F4A] hover:bg-[#E8F0E8]'
                }`}
              >
                {isAutoPlaying ? '⏸️ Pause' : '▶️ Auto-play'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-4xl mx-auto">
          {[
            { label: 'Total Tips', value: '100+', icon: '💡' },
            { label: 'Categories', value: '7', icon: '📂' },
            { label: 'Daily Practice', value: '5 min', icon: '⏰' },
            { label: 'Evidence-Based', value: '100%', icon: '🔬' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg">
              <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
} 