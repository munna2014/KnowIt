<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first user (or create one if none exists)
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'John Doe',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Create sample blog posts
        $posts = [
            [
                'title' => 'UX review presentations',
                'content' => "How to run a structured critique that helps your team align quickly.\n\nThis post is part of the KnowIt community feed. Share what you are learning, ask questions, and connect with creators who inspire your work.\n\nUse the navigation above to explore more posts, or return to the blog feed for the latest updates.\n\nRunning effective UX review presentations is crucial for team alignment and product success. Here are some key strategies:\n\n1. **Set Clear Objectives**: Before the presentation, define what you want to achieve. Are you seeking feedback on specific design decisions? Looking for validation of user research findings? Or trying to align stakeholders on the product direction?\n\n2. **Structure Your Content**: Organize your presentation with a clear beginning, middle, and end. Start with context, present your findings or designs, and conclude with actionable next steps.\n\n3. **Encourage Participation**: Make your presentation interactive. Ask specific questions, use polls, or break into small groups for discussion. This keeps everyone engaged and ensures you get valuable feedback.\n\n4. **Document Everything**: Take notes during the session and share a summary afterward. This ensures everyone is on the same page and creates a record for future reference.\n\n5. **Follow Up**: Don't let the conversation end when the presentation does. Schedule follow-up meetings, create action items, and check in regularly on progress.\n\nBy following these guidelines, you can run more effective UX review presentations that drive real results for your team and product.",
                'excerpt' => 'How to run a structured critique that helps your team align quickly.',
                'category' => 'design',
                'featured_image' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
                'status' => 'published',
                'published_at' => now(),
                'tags' => ['design', 'ux', 'presentation', 'team'],
                'views_count' => 42,
                'likes_count' => 8,
            ],
            [
                'title' => 'Getting Started with React Hooks',
                'content' => "A comprehensive guide to understanding and using React Hooks in your applications.\n\nReact Hooks have revolutionized how we write React components. They allow us to use state and other React features without writing a class component.\n\n## What are React Hooks?\n\nHooks are functions that let you \"hook into\" React state and lifecycle features from function components. They were introduced in React 16.8 and have become the standard way to write React components.\n\n## The Most Common Hooks\n\n### useState\nThe useState hook lets you add state to functional components:\n\n```javascript\nconst [count, setCount] = useState(0);\n```\n\n### useEffect\nThe useEffect hook lets you perform side effects in function components:\n\n```javascript\nuseEffect(() => {\n  document.title = `Count: ` + count;\n}, [count]);\n```\n\n### useContext\nThe useContext hook lets you consume context in functional components:\n\n```javascript\nconst theme = useContext(ThemeContext);\n```\n\n## Best Practices\n\n1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions.\n2. **Use the dependency array correctly** - Make sure to include all dependencies in useEffect's dependency array.\n3. **Create custom hooks for reusable logic** - Extract component logic into custom hooks when it can be reused.\n\nHooks make React code more readable and easier to test. Start using them in your next project!",
                'excerpt' => 'A comprehensive guide to understanding and using React Hooks in your applications.',
                'category' => 'development',
                'featured_image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'tags' => ['react', 'javascript', 'hooks', 'frontend'],
                'views_count' => 156,
                'likes_count' => 23,
            ],
            [
                'title' => 'The Future of Web Development',
                'content' => "Exploring emerging trends and technologies that will shape the future of web development.\n\nThe web development landscape is constantly evolving. New frameworks, tools, and methodologies emerge regularly, changing how we build and deploy web applications.\n\n## Key Trends to Watch\n\n### 1. Server-Side Rendering (SSR) and Static Site Generation (SSG)\nFrameworks like Next.js, Nuxt.js, and SvelteKit are making it easier to build fast, SEO-friendly applications with better performance.\n\n### 2. Edge Computing\nEdge functions and edge computing are bringing computation closer to users, reducing latency and improving user experience.\n\n### 3. WebAssembly (WASM)\nWebAssembly is enabling high-performance applications in the browser, opening up new possibilities for web applications.\n\n### 4. Progressive Web Apps (PWAs)\nPWAs continue to bridge the gap between web and native applications, offering app-like experiences in the browser.\n\n### 5. AI and Machine Learning Integration\nAI tools are becoming more integrated into development workflows, from code generation to automated testing.\n\n## What This Means for Developers\n\n- **Stay curious and keep learning** - The field is always changing, so continuous learning is essential.\n- **Focus on fundamentals** - While frameworks change, core web technologies remain important.\n- **Embrace new tools gradually** - Don't jump on every new trend, but be open to adopting proven technologies.\n- **Consider user experience first** - All these technologies should ultimately serve to create better user experiences.\n\nThe future of web development is exciting, with new possibilities emerging all the time. Stay informed, experiment with new technologies, and always keep the user at the center of your decisions.",
                'excerpt' => 'Exploring emerging trends and technologies that will shape the future of web development.',
                'category' => 'technology',
                'featured_image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'tags' => ['web development', 'technology', 'future', 'trends'],
                'views_count' => 89,
                'likes_count' => 15,
            ],
        ];

        foreach ($posts as $postData) {
            BlogPost::create([
                'user_id' => $user->id,
                'title' => $postData['title'],
                'content' => $postData['content'],
                'excerpt' => $postData['excerpt'],
                'category' => $postData['category'],
                'featured_image' => $postData['featured_image'],
                'status' => $postData['status'],
                'published_at' => $postData['published_at'],
                'tags' => $postData['tags'],
                'views_count' => $postData['views_count'],
                'likes_count' => $postData['likes_count'],
            ]);
        }
    }
}
