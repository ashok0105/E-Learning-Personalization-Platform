const axios = require("axios");

/**
 * GET /api/youtube/search?query=python
 * Searches YouTube Data API v3 and returns video results.
 * Requires YOUTUBE_API_KEY in .env
 */
exports.searchVideos = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Query parameter is required. Example: ?query=python" });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "YOUTUBE_API_KEY is not configured in .env" });
        }

        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: query,
                maxResults: 10,
                type: "video",
                relevanceLanguage: "en",
                key: apiKey
            }
        });

        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
        }));

        res.json({
            query,
            totalResults: response.data.pageInfo?.totalResults,
            count: videos.length,
            videos
        });
    } catch (error) {
        console.error("YouTube API error:", error.response?.data || error.message);

        if (error.response?.status === 403) {
            return res.status(403).json({
                message: "YouTube API quota exceeded or invalid API key",
                error: error.response.data?.error?.message
            });
        }

        res.status(500).json({
            message: "Error fetching YouTube results",
            error: error.message
        });
    }
};

/**
 * GET /api/youtube/video/:videoId
 * Get details of a single YouTube video
 */
exports.getVideoDetails = async (req, res) => {
    try {
        const { videoId } = req.params;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "YOUTUBE_API_KEY is not configured" });
        }

        const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
            params: {
                part: "snippet,contentDetails,statistics",
                id: videoId,
                key: apiKey
            }
        });

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ message: "Video not found" });
        }

        const video = response.data.items[0];
        res.json({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high?.url,
            channelTitle: video.snippet.channelTitle,
            duration: video.contentDetails.duration, // ISO 8601 format e.g. PT12M34S
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            embedUrl: `https://www.youtube.com/embed/${video.id}`
        });
    } catch (error) {
        console.error("YouTube video details error:", error.message);
        res.status(500).json({ message: "Error fetching video details" });
    }
};
