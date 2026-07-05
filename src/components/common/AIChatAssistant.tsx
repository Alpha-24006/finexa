import React, { useState, useRef, useEffect } from 'react';
import { useBudgetContext } from '../../context/BudgetContext';
import { useBudget } from '../../hooks/useBudget';
import { usePrediction } from '../../hooks/usePrediction';
import { formatCurrency } from '../../utils/currency';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { expenses } = useBudgetContext();
  const { totalSpent, overallLimit, remainingOverall, suggestions } = useBudget();
  const { forecastResults } = usePrediction();
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hi! I am your Finexa AI Companion. 🤖🔮 I can analyze your spending habits, help you manage budgets, and project future expenses. 

Try asking:
• "How is my budget looking?"
• "Which category did I spend the most on?"
• "What is my forecast for next month?"
• "Give me some tips to save money."`,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Process AI response
    setTimeout(() => {
      const responseText = getAIResponse(inputMessage.toLowerCase());
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  const getAIResponse = (query: string): string => {
    // 1. Budget status query
    if (query.includes('budget') || query.includes('limit') || query.includes('remaining')) {
      if (overallLimit === 0) {
        return "You haven't set an overall budget yet! Go to the Budgets page to set a monthly limit so I can analyze it for you. 💰";
      }
      const pct = Math.round((totalSpent / overallLimit) * 100);
      let reply = `Your overall budget is ${formatCurrency(overallLimit)}. So far this month, you have spent ${formatCurrency(totalSpent)} (${pct}% utilized). `;
      if (totalSpent > overallLimit) {
        reply += `⚠️ You are over budget by ${formatCurrency(totalSpent - overallLimit)}! Try to pause all discretionary shopping.`;
      } else {
        reply += `✅ You have ${formatCurrency(remainingOverall)} remaining for this month. Keep it up!`;
      }
      return reply;
    }

    // 2. Highest spending query
    if (query.includes('most') || query.includes('highest') || query.includes('category') || query.includes('spend')) {
      if (expenses.length === 0) {
        return "I don't see any expenses recorded yet. Once you add transactions, I'll tell you where your money is going! 📊";
      }
      const categorySums: Record<string, number> = {};
      expenses.forEach(e => {
        categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
      });

      let highestCat = '';
      let highestAmt = 0;
      Object.keys(categorySums).forEach(cat => {
        if (categorySums[cat] > highestAmt) {
          highestAmt = categorySums[cat];
          highestCat = cat;
        }
      });

      return `Looking at your history, your highest spending category is **${highestCat}** with a total of **${formatCurrency(highestAmt)}**. 
This represents ${Math.round((highestAmt / expenses.reduce((s, e) => s + e.amount, 0)) * 100)}% of your total lifetime recorded expenses.`;
    }

    // 3. Forecast queries
    if (query.includes('forecast') || query.includes('predict') || query.includes('future') || query.includes('next month')) {
      const nextMonthEstimate = forecastResults.nextMonthEstimate;
      if (nextMonthEstimate === 0) {
        return "I need at least 1 month of expense records to generate predictions. Try logging some items and I will forecast next month's total!";
      }
      return `🔮 My AI Forecasting engine predicts you will spend **${formatCurrency(nextMonthEstimate)}** next month (using the selected **${forecastResults.dataPoints.length > 0 ? 'predictive regression' : 'model'}**). 
The AI confidence score for this prediction is **${forecastResults.confidence}%**, with an expected quarterly trajectory of **${formatCurrency(forecastResults.quarterEstimate)}**.`;
    }

    // 4. Savings tips
    if (query.includes('save') || query.includes('tip') || query.includes('recommendation') || query.includes('advice')) {
      return `💡 Here are some tailor-made tips based on your current budgets:
      
1. ${suggestions[0] || 'Create category limits to enforce micro-savings.'}
2. **50/30/20 Rule**: Consider allocating 50% for Needs, 30% for Wants, and 20% for Savings.
3. **Dining Out**: Discretionary food delivery represents a major leakage point in many profiles. Making coffee at home can save up to ₹1,500/month.
4. **Subscription Check**: Periodically review active streaming packages or memberships. Canceling even one unused tier helps!`;
    }

    // 5. Help queries
    if (query.includes('help') || query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return "Hello! I am your AI assistant. I can help with queries regarding your 'budget limit', 'highest spending category', 'next month forecast', or 'saving tips'. What can I look up for you today?";
    }

    // Fallback response
    return "I hear you! As a financial forecasting agent, I can analyze your numbers. Try asking about your 'monthly budget limit', 'highest category spent', or 'next month forecast' to see real-time data analyses.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[480px] rounded-3xl glass-card border border-white/20 dark:border-slate-800/80 shadow-2xl flex flex-col mb-4 overflow-hidden animate-float-slow">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-6 h-6 animate-pulse-subtle" />
              <div>
                <span className="font-extrabold text-sm tracking-wide">Finexa AI Advisor</span>
                <span className="block text-[10px] text-indigo-200 font-semibold tracking-widest uppercase">Predictive Bot</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/10 dark:bg-black/10">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary self-start shrink-0">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-sm border
                  ${msg.sender === 'user' 
                    ? 'bg-primary text-white border-primary/20 rounded-tr-none' 
                    : 'bg-white/70 dark:bg-slate-900/70 text-foreground border-white/20 dark:border-slate-800/50 rounded-tl-none'
                  }
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2 bg-white/20 dark:bg-slate-900/20">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about forecast, budget, savings..."
              className="flex-1 glass-input text-xs font-medium bg-white/40 dark:bg-slate-950/40 border-white/25 focus:ring-primary"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-foreground text-white flex items-center justify-center active:scale-95 transition-all shadow-md shadow-primary/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200"
        title="AI Assistant Advice"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse-subtle" />}
      </button>
    </div>
  );
};
