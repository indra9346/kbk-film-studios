import React, { useState } from 'react';
import { Youtube, ExternalLink, Play, Sparkles, CheckCircle2, Flame, Video, Calendar, Eye, Compass } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

interface YoutubeChannelShowcaseProps {
  className?: string;
}

export const YoutubeChannelShowcase: React.FC<YoutubeChannelShowcaseProps> = ({
  className = ''
}) => {
  const { cms } = useStudio();
  const [activeTab, setActiveTab] = useState<'popular' | 'latest' | 'college_village'>('popular');

  const youtubeUrl = cms?.youtubeUrl || 'https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX';
  const youtubeHandle = cms?.youtubeHandle || '@bharathkumarglp2003';
  const founderName = cms?.founderName || 'Kurudi Bharath Kumar';

  // Real YouTube Channel Content with distinct video metadata
  const popularShortsAndVideos = [
    {
      id: 'pop-1',
      title: 'Share ur Hindupur Batch 💥',
      category: 'Viral Short',
      duration: '0:45',
      views: '31K views',
      timeAgo: 'Viral Hit',
      badge: '🔥 31K Views'
    },
    {
      id: 'pop-2',
      title: 'The True Emotions of Love Reddy Movie',
      category: 'Cinema Feature',
      duration: '1:02',
      views: '11K views',
      timeAgo: '1 year ago',
      badge: '🎬 11K Views'
    },
    {
      id: 'pop-3',
      title: 'Huge crowd in Gouribidanuru bypass ganesha',
      category: 'Festival Reel',
      duration: '0:58',
      views: '9.7K views',
      timeAgo: 'Festival Special',
      badge: '9.7K Views'
    },
    {
      id: 'pop-4',
      title: 'Hindupur King poster launch',
      category: 'Launch Event',
      duration: '0:40',
      views: '9.6K views',
      timeAgo: 'Trending',
      badge: '9.6K Views'
    },
    {
      id: 'pop-5',
      title: 'Balayya at Hindupur 💥 2024 Elections rally',
      category: 'Public Event',
      duration: '0:50',
      views: '7.2K views',
      timeAgo: '2024 Event',
      badge: '7.2K Views'
    },
    {
      id: 'pop-6',
      title: 'Love Reddy movie review & response',
      category: 'Movie Review',
      duration: '3:03',
      views: '6.9K views',
      timeAgo: '1 year ago',
      badge: '6.9K Views'
    }
  ];

  const latestVideos = [
    {
      id: 'lat-1',
      title: 'A memorable Saraswati Puja and Annual Day celebration at Gollapuram ZP High School',
      category: 'School Event',
      duration: '1:43',
      views: '136 views',
      timeAgo: '4 months ago',
      badge: 'Recent Upload'
    },
    {
      id: 'lat-2',
      title: 'Violence rules 💥 Ganesh nimarjanam in gollapuram',
      category: 'Ganesh Festival',
      duration: '4:59',
      views: '912 views',
      timeAgo: '11 months ago',
      badge: 'Festival Highlight'
    },
    {
      id: 'lat-3',
      title: 'శ్రీ వరసిద్ది వినాయక సేవా సమితి వారి సంబరాలు (Gollapuram Celebration)',
      category: 'Traditional',
      duration: '1:31',
      views: '141 views',
      timeAgo: '11 months ago',
      badge: 'Ceremony Cut'
    },
    {
      id: 'lat-4',
      title: 'Suguru anjaneya swamy temple || Mana Hindupur ❤️',
      category: 'Devotional & Cultural',
      duration: '1:00',
      views: '358 views',
      timeAgo: '1 year ago',
      badge: 'Temple Film'
    },
    {
      id: 'lat-5',
      title: 'గోళ్ళాపురం గ్రామ పంచాయితీ నందు నూతన సబ్ స్టేషన్ కు భూమి పూజ చేసిన MLA నందమూరి బాలకృష్ణ గారు',
      category: 'Official Coverage',
      duration: '1:21',
      views: '530 views',
      timeAgo: '1 year ago',
      badge: 'VIP Event'
    },
    {
      id: 'lat-6',
      title: 'Ganesh Nimarjanam in Hindupur 2024 Highlights',
      category: 'Event Highlight',
      duration: '4:48',
      views: '49 views',
      timeAgo: '1 year ago',
      badge: 'Full Reel'
    }
  ];

  const collegeAndVillageVibes = [
    {
      id: 'col-1',
      title: 'History tells us 💥 Enlight degree college in Hindupur',
      category: 'College Memories',
      duration: '1:10',
      views: '3.3K views',
      timeAgo: 'SKU / Enlight Life',
      badge: '3.3K Views'
    },
    {
      id: 'col-2',
      title: 'That was where it began || Enlight degree college in Hindupur',
      category: 'Origin Story',
      duration: '0:55',
      views: '2K views',
      timeAgo: 'SKU Life',
      badge: '2K Views'
    },
    {
      id: 'col-3',
      title: 'Most Memorable Emotional moment In My Life ❤️ || Enlight Degree College',
      category: 'Emotional Keepsake',
      duration: '0:52',
      views: '1.7K views',
      timeAgo: '3 years ago',
      badge: 'Memories'
    },
    {
      id: 'col-4',
      title: 'Independence Day Celebrations In Our Village Gollapuram || Hindupur',
      category: 'Village Heritage',
      duration: '2:01',
      views: '572 views',
      timeAgo: '3 years ago',
      badge: 'Gollapuram'
    },
    {
      id: 'col-5',
      title: 'మన గోళ్ళాపురం గ్రామంలో శ్రీ మారుతి నాటక మండలి వారి "బలి కోరిన బగ్న ప్రేమ"',
      category: 'Drama & Theatre',
      duration: '1:44:03',
      views: '833 views',
      timeAgo: '3 years ago',
      badge: 'Full Drama Film'
    },
    {
      id: 'col-6',
      title: 'Goa Journey Vibes With Enlight College Friends ♥️',
      category: 'Travel & Lifestyle',
      duration: '3:48',
      views: '280 views',
      timeAgo: '3 years ago',
      badge: 'Travel Story'
    }
  ];

  const currentList =
    activeTab === 'popular'
      ? popularShortsAndVideos
      : activeTab === 'latest'
      ? latestVideos
      : collegeAndVillageVibes;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072419] via-[#0a1612] to-[#030906] border border-[#14532d]/60 shadow-2xl p-6 sm:p-10 lg:p-12">
        {/* Subtle Ambient Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-emerald-900/40 relative z-10">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
              Official YouTube Showcase & Live Activity Stream
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-100">
              Explore Kurudi Bharath Kumar on YouTube
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 max-w-xl font-light">
              Official video archive: From grand Hindupur festival master cuts, Love Reddy cinema features, and cultural dramas to high-energy wedding teasers.
            </p>
          </div>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/30 transition-all duration-300 hover:scale-105 group"
          >
            <Youtube className="w-4 h-4 fill-white" />
            <span>Open YouTube Channel</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 relative z-10 items-stretch">
          {/* Left Column: Replicated YouTube Channel Profile Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#0d2a1f]/90 border border-emerald-500/30 shadow-xl space-y-6">
            <div className="space-y-5">
              {/* Founder Profile Image Card */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black/40 border border-emerald-500/20 group">
                <img
                  src="/assets/founder.jpg"
                  alt={`${founderName} - YouTube Channel`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Verified YouTube Channel Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-red-500/40 text-red-400 text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                  <Youtube className="w-3.5 h-3.5 fill-red-500" />
                  <span>Official Creator</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-ivory-200">
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {youtubeHandle}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded backdrop-blur-sm border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                  </span>
                </div>
              </div>

              {/* Channel Meta Information */}
              <div className="space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Kurudi Bharath Kumar Official
                </h3>

                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-light">
                  Share your videos with friends, family, and the world.
                </p>

                <div className="text-[11px] text-ivory-400 font-mono pt-1">
                  <span className="text-emerald-400">youtube.com</span> • Live video archive & event stories
                </div>
              </div>

              {/* Real Channel Statistics Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-emerald-900/50 text-center">
                <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/15">
                  <span className="text-[10px] text-ivory-400 block uppercase tracking-wider">Subscribers</span>
                  <span className="font-serif text-base font-bold text-gold">392</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/15">
                  <span className="text-[10px] text-ivory-400 block uppercase tracking-wider">Videos</span>
                  <span className="font-serif text-base font-bold text-emerald-400">86</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/15">
                  <span className="text-[10px] text-ivory-400 block uppercase tracking-wider">Top Viral Reach</span>
                  <span className="font-serif text-base font-bold text-red-400">31K+</span>
                </div>
              </div>
            </div>

            {/* Direct Channel Link Box */}
            <div className="space-y-3 pt-2">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300"
              >
                <Youtube className="w-4 h-4 fill-white" />
                <span>Navigate to YouTube Channel</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <p className="text-[10px] text-center text-ivory-400/80 font-mono truncate">
                {youtubeUrl}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Real Video Streams & Filter Tabs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Category Filter Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-emerald-900/40 pb-3 flex-wrap">
              <div className="flex items-center gap-2 relative z-20">
                <button
                  type="button"
                  id="tab-btn-popular"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab('popular');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'popular'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-black/40 text-ivory-300 hover:bg-black/60 border border-emerald-500/20'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Viral & Popular ({popularShortsAndVideos.length})</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-latest"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab('latest');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'latest'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-black/40 text-ivory-300 hover:bg-black/60 border border-emerald-500/20'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Latest Uploads ({latestVideos.length})</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-college"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab('college_village');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'college_village'
                      ? 'bg-gold text-black shadow-md font-bold'
                      : 'bg-black/40 text-ivory-300 hover:bg-black/60 border border-emerald-500/20'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>College & Heritage ({collegeAndVillageVibes.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-ivory-400 hidden sm:inline">Tap to watch on YouTube</span>
            </div>

            {/* Video List */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {currentList.map((item) => (
                <a
                  key={item.id}
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-black/40 hover:bg-[#0e2d21] border border-emerald-500/20 hover:border-emerald-500/50 flex items-center gap-4 transition-all duration-300 group shadow-md"
                >
                  {/* Branded YouTube Video Card Preview */}
                  <div className="relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#2a0c0c] via-[#150505] to-black shrink-0 border border-red-500/30 flex items-center justify-center group-hover:border-red-500/70 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-white text-[9px] font-mono z-10 border border-white/10">
                      {item.duration}
                    </span>
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        {item.badge}
                      </span>
                      <span className="text-[10px] text-ivory-400 font-medium truncate">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-serif text-xs sm:text-sm font-bold text-ivory-100 group-hover:text-gold transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-ivory-400 font-light">
                      <span className="flex items-center gap-1 font-medium text-emerald-300">
                        <Eye className="w-3 h-3 text-emerald-400" /> {item.views}
                      </span>
                      <span>•</span>
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center justify-center p-2 text-ivory-400 group-hover:text-gold transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>

            {/* Quick Feature Callouts */}
            <div className="p-3.5 rounded-xl bg-[#092218] border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ivory-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>86+ Real Videos & Shorts Live</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gollapuram & Hindupur Event Highlights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
