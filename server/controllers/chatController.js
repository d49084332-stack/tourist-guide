const axios = require('axios');
const Chat = require('../models/Chat');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are an intelligent travel assistant designed to help users discover tourist destinations, understand travel options, and create personalized travel recommendations.

Your responsibilities:
1. Help users explore tourist destinations in India
2. Provide information about attractions, activities, and travel tips
3. Answer questions about travel planning, budgeting, and itineraries
4. Make personalized destination recommendations based on user preferences
5. Provide travel-related information and guidance

When recommending destinations:
- Consider user preferences, interests, and budget
- Provide detailed information about attractions and activities
- Suggest the best time to visit
- Give estimated budget information
- Recommend nearby attractions

Available destination categories: Beach, Hill Station, Historical, Religious, Adventure, Wildlife, Nature, Heritage, Cultural, Family, Shopping, Food, Waterfalls

Always be helpful, friendly, and provide accurate travel information. If you don't have specific information, ask clarifying questions or suggest the user explore the destination details in the app.`;

// @desc    Send message to AI travel assistant
// @route   POST /api/chat/message
// @access  Public / Private
exports.sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    let chat = null;
    let messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    if (userId) {
      // Get or create chat for logged-in user
      if (chatId) {
        chat = await Chat.findById(chatId);
        if (!chat || chat.userId.toString() !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Chat not found or access denied'
          });
        }
      } else {
        chat = await Chat.create({
          userId,
          messages: [],
          title: message.substring(0, 50)
        });
      }

      // Add user message to chat
      chat.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      await chat.save();

      messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
    } else {
      // Guest session: pass user message directly
      messages.push({ role: 'user', content: message });
    }


    // Call Groq API with candidate model cascade starting with llama-3.1-8b-instant
    const candidateModels = [
      process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      'groq/compound-mini',
      'openai/gpt-oss-20b'
    ];

    let assistantMessage = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const groqResponse = await axios.post(
          GROQ_API_URL,
          {
            model: modelName,
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        if (groqResponse.data?.choices?.[0]?.message?.content) {
          assistantMessage = groqResponse.data.choices[0].message.content;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Groq model ${modelName} unavailable, cascading to next model...`);
      }
    }

    if (!assistantMessage) {
      throw lastError || new Error('Failed to get AI response from Groq');
    }


    // Add assistant message to chat if user is logged in
    if (chat) {
      chat.messages.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      });
      await chat.save();
    }

    res.status(200).json({
      success: true,
      chatId: chat ? chat._id : null,
      message: assistantMessage
    });
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || 'Failed to get AI response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await Chat.find({ userId })
      .sort('-updatedAt')
      .skip(skip)
      .limit(parseInt(limit))
      .select('_id title createdAt updatedAt');

    const total = await Chat.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: chats.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single chat
// @route   GET /api/chat/:id
// @access  Private
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check ownership
    if (chat.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/:id
// @access  Private
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check ownership
    if (chat.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Chat.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear all chats for user
// @route   DELETE /api/chat/all
// @access  Private
exports.clearAllChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Chat.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'All chats cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
