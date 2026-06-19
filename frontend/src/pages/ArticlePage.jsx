import { ArrowLeft, Clock, Dumbbell } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const articles = {
  'beginner-workouts': {
    title: '5 beginner workouts to start this week',
    readTime: '6 min read',
    intro: 'Start simple. The goal is not to be perfect; the goal is to build a repeatable routine you can actually keep.',
    sections: [
      ['Day 1: Full Body Basics', 'Do bodyweight squats, incline push-ups, glute bridges, and a short walk. Keep the pace easy and focus on clean movement.'],
      ['Day 2: Core and Mobility', 'Try dead bugs, plank holds, cat-cow stretches, and hip openers. This helps your body feel ready for harder workouts later.'],
      ['Day 3: Light Cardio', 'Walk for 20 to 30 minutes or use a bike at an easy pace. You should be able to talk while moving.'],
      ['Day 4: Strength Repeat', 'Repeat the first full-body workout and add one more set only if it still feels comfortable.'],
      ['Day 5: Recovery Session', 'Finish the week with stretching, breathing, and a short walk. Recovery is part of progress.'],
    ],
  },
  'stay-consistent': {
    title: 'How to stay consistent on busy days',
    readTime: '4 min read',
    intro: 'Consistency becomes easier when your plan is small, clear, and realistic for your real life.',
    sections: [
      ['Use a minimum workout', 'On busy days, do only 10 minutes. A short workout keeps the habit alive and removes the pressure.'],
      ['Prepare before the day starts', 'Put your shoes, bottle, and workout clothes somewhere visible. Reducing friction makes action easier.'],
      ['Track small wins', 'Write down every workout, even the short ones. Seeing progress helps you continue.'],
      ['Do not restart from zero', 'Missing one day is normal. The next workout is simply the next step, not a punishment.'],
    ],
  },
  'meal-prep': {
    title: 'Simple meal prep for fitness beginners',
    readTime: '7 min read',
    intro: 'Meal prep does not need to be complicated. Start with simple meals that support energy, training, and recovery.',
    sections: [
      ['Choose one protein', 'Prepare chicken, eggs, tuna, beans, or yogurt for a few meals. Protein helps recovery after workouts.'],
      ['Add easy carbs', 'Rice, potatoes, oats, and bread can give you training energy. Keep the portions simple and consistent.'],
      ['Use vegetables you like', 'Pick vegetables you can actually eat regularly. Frozen vegetables are totally fine.'],
      ['Keep snacks ready', 'Fruit, yogurt, nuts, or boiled eggs can stop you from skipping meals or overeating later.'],
      ['Repeat meals', 'Beginners do not need a new recipe every day. Repeating simple meals makes the routine easier.'],
    ],
  },
};

export default function ArticlePage() {
  const { slug } = useParams();
  const article = articles[slug] || articles['beginner-workouts'];

  return (
    <main className="article-page">
      <div className="article-shell">
        <Link className="article-back" to="/#stories"><ArrowLeft size={18} /> Back to tips</Link>
        <div className="article-hero-card">
          <div className="article-icon"><Dumbbell size={34} /></div>
          <p className="article-meta"><Clock size={16} /> {article.readTime}</p>
          <h1>{article.title}</h1>
          <p>{article.intro}</p>
        </div>
        <div className="article-content">
          {article.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
