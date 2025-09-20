// src/agents/twitterAgent.js
const axios = require('axios');

/**
 * Twitter Agent - 获取X用户数据
 * 功能：从X (Twitter) API获取用户基本信息、推文、互动数据等
 */

class TwitterAgent {
  constructor() {
    this.baseURL = 'https://api.twitter.com/2';
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!this.bearerToken) {
      console.warn('⚠️  TWITTER_BEARER_TOKEN not found in environment variables');
      console.warn('⚠️  Twitter Agent will use mock data for development');
    }
  }

  /**
   * 获取用户基本信息
   * @param {string} username - X用户名 (不含@符号)
   * @returns {Object} 用户基本信息
   */
  async getUserProfile(username) {
    try {
      console.log(`🔍 Fetching profile for @${username}`);
      
      if (!this.bearerToken) {
        return this.getMockUserProfile(username);
      }

      const response = await axios.get(`${this.baseURL}/users/by/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          'user.fields': 'id,name,username,description,public_metrics,verified,created_at,location,url,profile_image_url'
        }
      });

      if (response.data.data) {
        console.log(`✅ Successfully fetched profile for @${username}`);
        return {
          success: true,
          data: response.data.data,
          source: 'twitter_api'
        };
      } else {
        throw new Error('User not found');
      }

    } catch (error) {
      console.error(`❌ Error fetching profile for @${username}:`, error.message);
      
      // 如果API失败，返回模拟数据
      return this.getMockUserProfile(username);
    }
  }

  /**
   * 获取用户最近推文
   * @param {string} userId - X用户ID
   * @param {number} maxResults - 最大推文数量 (默认10)
   * @returns {Object} 用户推文数据
   */
  async getUserTweets(userId, maxResults = 10) {
    try {
      console.log(`📝 Fetching tweets for user ID: ${userId}`);
      
      if (!this.bearerToken) {
        return this.getMockUserTweets(userId);
      }

      const response = await axios.get(`${this.baseURL}/users/${userId}/tweets`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          'max_results': maxResults,
          'tweet.fields': 'id,text,created_at,public_metrics,context_annotations,entities'
        }
      });

      if (response.data.data) {
        console.log(`✅ Successfully fetched ${response.data.data.length} tweets`);
        return {
          success: true,
          data: response.data.data,
          source: 'twitter_api'
        };
      } else {
        throw new Error('No tweets found');
      }

    } catch (error) {
      console.error(`❌ Error fetching tweets for user ${userId}:`, error.message);
      
      // 如果API失败，返回模拟数据
      return this.getMockUserTweets(userId);
    }
  }

  /**
   * 综合分析用户数据
   * @param {string} username - X用户名
   * @returns {Object} 综合用户分析数据
   */
  async analyzeUser(username) {
    try {
      console.log(`🔬 Starting comprehensive analysis for @${username}`);
      
      // 1. 获取用户基本信息
      const profileResult = await this.getUserProfile(username);
      
      if (!profileResult.success) {
        throw new Error('Failed to fetch user profile');
      }

      const userProfile = profileResult.data;
      
      // 2. 获取用户推文
      const tweetsResult = await this.getUserTweets(userProfile.id);
      
      // 3. 综合分析数据
      const analysisData = {
        user: {
          id: userProfile.id,
          username: userProfile.username,
          name: userProfile.name,
          description: userProfile.description || '',
          verified: userProfile.verified || false,
          followers_count: userProfile.public_metrics?.followers_count || 0,
          following_count: userProfile.public_metrics?.following_count || 0,
          tweet_count: userProfile.public_metrics?.tweet_count || 0,
          created_at: userProfile.created_at,
          location: userProfile.location || '',
          url: userProfile.url || '',
          profile_image_url: userProfile.profile_image_url || ''
        },
        tweets: tweetsResult.success ? tweetsResult.data : [],
        engagement_metrics: this.calculateEngagementMetrics(tweetsResult.data || []),
        topics: this.extractTopics(tweetsResult.data || []),
        sentiment: this.analyzeSentiment(tweetsResult.data || []),
        activity_pattern: this.analyzeActivityPattern(tweetsResult.data || [])
      };

      console.log(`✅ Comprehensive analysis completed for @${username}`);
      return {
        success: true,
        data: analysisData,
        source: profileResult.source
      };

    } catch (error) {
      console.error(`❌ Error in comprehensive analysis for @${username}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * 计算互动指标
   * @param {Array} tweets - 推文数组
   * @returns {Object} 互动指标
   */
  calculateEngagementMetrics(tweets) {
    if (!tweets || tweets.length === 0) {
      return {
        avg_likes: 0,
        avg_retweets: 0,
        avg_replies: 0,
        total_engagement: 0
      };
    }

    const totalLikes = tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.like_count || 0), 0);
    const totalRetweets = tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.retweet_count || 0), 0);
    const totalReplies = tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.reply_count || 0), 0);

    return {
      avg_likes: Math.round(totalLikes / tweets.length),
      avg_retweets: Math.round(totalRetweets / tweets.length),
      avg_replies: Math.round(totalReplies / tweets.length),
      total_engagement: totalLikes + totalRetweets + totalReplies
    };
  }

  /**
   * 提取话题标签
   * @param {Array} tweets - 推文数组
   * @returns {Array} 话题标签数组
   */
  extractTopics(tweets) {
    if (!tweets || tweets.length === 0) return [];

    const hashtags = new Set();
    tweets.forEach(tweet => {
      if (tweet.entities?.hashtags) {
        tweet.entities.hashtags.forEach(hashtag => {
          hashtags.add(hashtag.tag.toLowerCase());
        });
      }
    });

    return Array.from(hashtags).slice(0, 10); // 返回前10个话题
  }

  /**
   * 分析情感倾向
   * @param {Array} tweets - 推文数组
   * @returns {Object} 情感分析结果
   */
  analyzeSentiment(tweets) {
    if (!tweets || tweets.length === 0) {
      return { sentiment: 'neutral', confidence: 0 };
    }

    // 简单的情感分析（基于关键词）
    const positiveWords = ['great', 'amazing', 'love', 'awesome', 'fantastic', 'excellent', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'disappointed', 'frustrated'];

    let positiveCount = 0;
    let negativeCount = 0;

    tweets.forEach(tweet => {
      const text = tweet.text.toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence: positiveCount / tweets.length };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence: negativeCount / tweets.length };
    } else {
      return { sentiment: 'neutral', confidence: 0 };
    }
  }

  /**
   * 分析活动模式
   * @param {Array} tweets - 推文数组
   * @returns {Object} 活动模式分析
   */
  analyzeActivityPattern(tweets) {
    if (!tweets || tweets.length === 0) {
      return { most_active_hour: 12, tweet_frequency: 'low' };
    }

    const hours = tweets.map(tweet => new Date(tweet.created_at).getHours());
    const hourCounts = {};
    hours.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );

    const avgTweetsPerDay = tweets.length / 7; // 假设是最近7天的数据
    let frequency = 'low';
    if (avgTweetsPerDay > 5) frequency = 'high';
    else if (avgTweetsPerDay > 2) frequency = 'medium';

    return {
      most_active_hour: parseInt(mostActiveHour),
      tweet_frequency: frequency,
      avg_tweets_per_day: Math.round(avgTweetsPerDay * 10) / 10
    };
  }

  /**
   * 获取模拟用户数据（用于开发测试）
   * @param {string} username - 用户名
   * @returns {Object} 模拟用户数据
   */
  getMockUserProfile(username) {
    console.log(`🎭 Using mock data for @${username}`);
    return {
      success: true,
      data: {
        id: '123456789',
        username: username,
        name: `${username.charAt(0).toUpperCase() + username.slice(1)} User`,
        description: 'Product Manager passionate about AI and user experience. Building the future of digital products.',
        verified: false,
        public_metrics: {
          followers_count: Math.floor(Math.random() * 10000) + 1000,
          following_count: Math.floor(Math.random() * 1000) + 100,
          tweet_count: Math.floor(Math.random() * 5000) + 500
        },
        created_at: '2020-01-01T00:00:00.000Z',
        location: 'San Francisco, CA',
        url: 'https://example.com',
        profile_image_url: 'https://via.placeholder.com/200x200'
      },
      source: 'mock_data'
    };
  }

  /**
   * 获取模拟推文数据（用于开发测试）
   * @param {string} userId - 用户ID
   * @returns {Object} 模拟推文数据
   */
  getMockUserTweets(userId) {
    console.log(`🎭 Using mock tweets for user ${userId}`);
    
    const mockTweets = [
      {
        id: '1',
        text: 'Just finished reading about the latest AI trends in product management. The future is exciting! #AI #ProductManagement',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        public_metrics: { like_count: 15, retweet_count: 3, reply_count: 2 }
      },
      {
        id: '2',
        text: 'Working on a new feature that will revolutionize user onboarding. Can\'t wait to share more details soon!',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        public_metrics: { like_count: 8, retweet_count: 1, reply_count: 1 }
      },
      {
        id: '3',
        text: 'User feedback is everything. Always listen to your customers and iterate based on their needs. #UX #CustomerFirst',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        public_metrics: { like_count: 22, retweet_count: 5, reply_count: 3 }
      }
    ];

    return {
      success: true,
      data: mockTweets,
      source: 'mock_data'
    };
  }
}

module.exports = TwitterAgent;
