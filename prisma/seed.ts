import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "World", slug: "world", color: "#EF4444", description: "Global news and international affairs" },
  { name: "Technology", slug: "technology", color: "#3B82F6", description: "Tech, AI, startups and innovation" },
  { name: "Politics", slug: "politics", color: "#8B5CF6", description: "Political news and government" },
  { name: "Business", slug: "business", color: "#10B981", description: "Markets, economy and finance" },
  { name: "Science", slug: "science", color: "#F59E0B", description: "Scientific discoveries and research" },
  { name: "Sports", slug: "sports", color: "#EC4899", description: "Sports news and results" },
  { name: "Entertainment", slug: "entertainment", color: "#F97316", description: "Movies, music and culture" },
  { name: "Health", slug: "health", color: "#06B6D4", description: "Health, wellness and medicine" },
];

const articles = [
  {
    title: "AI Models Now Surpass Human Experts in Medical Diagnosis",
    excerpt: "A new study from Stanford Medical School reveals that the latest generation of AI diagnostic tools are outperforming board-certified physicians in identifying rare diseases from medical imaging.",
    content: `<p>A groundbreaking study published in <em>Nature Medicine</em> this week has sent shockwaves through the medical community: artificial intelligence models are now consistently outperforming human specialists in diagnosing a wide range of conditions from medical scans.</p>
    <p>The research, conducted over 18 months at Stanford Medical School, tested five state-of-the-art AI systems against 240 board-certified radiologists and oncologists. The AI systems correctly identified malignant tumors, rare genetic disorders, and early-stage neurological conditions at a rate 23% higher than their human counterparts.</p>
    <h2>What This Means for Healthcare</h2>
    <p>"This is not about replacing doctors," said Dr. Sarah Chen, lead author of the study. "It's about giving them superpowers. When AI flags a case, the doctor can focus their expertise where it matters most."</p>
    <p>The implications are particularly significant for rural and underserved communities where specialist access is limited. Pilot programs in sub-Saharan Africa and rural India have already begun deploying these tools with remarkable results.</p>
    <h2>Industry Reaction</h2>
    <p>Major hospital networks have responded swiftly, with Mass General, Johns Hopkins, and the Mayo Clinic all announcing integration plans within the next 24 months. The FDA has fast-tracked approval reviews for three of the five systems tested.</p>
    <p>Not everyone is celebrating, however. The American Medical Association issued a cautious statement calling for "robust human oversight protocols" and warning against over-reliance on algorithmic diagnosis.</p>`,
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    category: "technology",
    tags: ["AI", "Healthcare", "Medicine", "Research"],
    featured: true,
  },
  {
    title: "Global Leaders Reach Historic Climate Agreement at Geneva Summit",
    excerpt: "After three days of marathon negotiations, 142 countries have signed the Geneva Climate Accord, pledging to achieve net-zero emissions by 2045 — five years ahead of previous targets.",
    content: `<p>In what climate scientists are calling "the most significant environmental agreement since the Paris Accord," representatives from 142 nations signed the Geneva Climate Accord late Thursday evening, committing to net-zero carbon emissions by 2045.</p>
    <p>The deal, brokered after an 18-hour final negotiating session, includes binding financial commitments totaling $4.2 trillion in green energy investment over the next decade, with a significant portion earmarked for developing nations.</p>
    <h2>Key Provisions</h2>
    <p>Among the accord's most ambitious provisions: a complete phase-out of coal power by 2035, mandatory carbon pricing mechanisms for signatory nations, and the creation of an international climate court with enforcement powers.</p>
    <p>"Today, humanity chose its future," said UN Secretary-General António Guterres, visibly emotional as he addressed the assembled delegates. "The children of tomorrow will know that their parents rose to the challenge."</p>
    <h2>Holdouts and Skeptics</h2>
    <p>Notably absent from the final signing were three of the world's top ten emitters, who objected to the enforcement mechanisms. Their absence drew sharp criticism from island nations facing existential threats from rising seas.</p>
    <p>Markets reacted positively to the news, with renewable energy stocks surging globally and fossil fuel companies seeing significant declines in pre-market trading.</p>`,
    coverImage: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1200&q=80",
    category: "world",
    tags: ["Climate", "Environment", "UN", "Policy"],
    featured: false,
  },
  {
    title: "OpenAI Unveils GPT-6: Can Hold a Conversation for 72 Hours Straight",
    excerpt: "The latest flagship model from OpenAI demonstrates unprecedented context retention, coherent multi-day reasoning, and what researchers are cautiously calling 'proto-planning' capabilities.",
    content: `<p>OpenAI has lifted the curtain on GPT-6, its most powerful language model to date, and the demos have left the AI research community simultaneously awed and unsettled.</p>
    <p>The model's headline capability is a 10-million token context window — enough to hold a coherent conversation spanning 72 hours of continuous dialogue while accurately referencing events from the very beginning of the exchange.</p>
    <h2>New Capabilities</h2>
    <p>Beyond raw context length, GPT-6 demonstrates what OpenAI researchers call "temporal reasoning" — the ability to track the passage of time within a conversation, remember what was said "yesterday" versus "an hour ago," and adjust its responses accordingly.</p>
    <p>In live demonstrations, the model successfully managed a complex software project over multiple simulated days, delegating tasks, following up on blockers, and adapting its plan when circumstances changed — all without human prompting.</p>
    <h2>Safety Concerns</h2>
    <p>OpenAI's safety team has published an unusually candid 47-page report alongside the launch, acknowledging that some of the model's emergent behaviors "were not anticipated during training" and warranted additional study before broader deployment.</p>
    <p>The model will initially be available only to enterprise partners under a supervised access program, with general availability expected in Q3.</p>`,
    coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    category: "technology",
    tags: ["OpenAI", "GPT", "Artificial Intelligence", "Machine Learning"],
    featured: true,
  },
  {
    title: "Federal Reserve Cuts Interest Rates for Third Consecutive Quarter",
    excerpt: "The Fed's decision to cut rates by 50 basis points signals growing concern about slowing economic growth, sending markets on a volatile ride as investors reassess their portfolios.",
    content: `<p>The Federal Reserve voted 8-1 Wednesday to cut its benchmark interest rate by half a percentage point, the third consecutive quarterly reduction as policymakers pivot decisively toward supporting economic growth over fighting inflation.</p>
    <p>Fed Chair Jerome Powell, speaking at a press conference following the decision, struck a notably dovish tone, suggesting the committee sees "meaningful downside risks" to employment that were not present six months ago.</p>
    <h2>Market Reaction</h2>
    <p>Markets gyrated wildly in the hours following the announcement. The S&P 500 initially surged 1.8% before giving back gains as investors parsed Powell's comments about potential recession risks. The 10-year Treasury yield fell to its lowest level since 2021.</p>
    <p>The dollar weakened against major currencies, while gold hit a fresh all-time high above $3,100 per ounce as investors sought safe-haven assets.</p>
    <h2>What It Means for Borrowers</h2>
    <p>The rate cut will flow through to consumer borrowing costs over the coming weeks. Mortgage rates, which had already been declining in anticipation of the move, are expected to fall further — potentially providing relief to a housing market that has been frozen by affordability concerns.</p>
    <p>Credit card rates will also decline, though economists note that the full benefit may take several billing cycles to appear on consumer statements.</p>`,
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
    category: "business",
    tags: ["Federal Reserve", "Economy", "Interest Rates", "Markets"],
    featured: false,
  },
  {
    title: "Scientists Discover Liquid Water Ocean Beneath Europa's Ice Shell",
    excerpt: "NASA's Europa Clipper mission has provided the most definitive evidence yet of a vast subsurface ocean, reigniting hopes for extraterrestrial life in our solar system.",
    content: `<p>In a discovery that NASA scientists are describing as "the most exciting in the history of planetary exploration," the Europa Clipper spacecraft has confirmed the existence of a liquid water ocean beneath Jupiter's moon Europa — and it's far larger than previously imagined.</p>
    <p>Data from the spacecraft's magnetometer and gravity instruments indicate an ocean roughly twice the volume of all Earth's oceans combined, sitting beneath an ice shell approximately 15 kilometers thick.</p>
    <h2>Signs of Habitability</h2>
    <p>More tantalizing still, thermal imaging has identified what appear to be hydrothermal vents on the ocean floor — similar to the deep-sea vents on Earth where life thrives in the complete absence of sunlight.</p>
    <p>"We're not saying there's life on Europa," said Dr. Britney Schmidt of Cornell University, a co-investigator on the mission. "We're saying the conditions that would be necessary for life as we understand it appear to be present. That's enormous."</p>
    <h2>Next Steps</h2>
    <p>NASA is already advancing plans for a follow-up lander mission that could drill through the ice and directly sample the ocean below. The mission, still in early development, would be the most complex robotic exploration ever attempted.</p>
    <p>Congress has been asked to approve a $6.2 billion budget for the Europa Lander program, with a target launch date of 2034.</p>`,
    coverImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&q=80",
    category: "science",
    tags: ["NASA", "Space", "Europa", "Astrobiology"],
    featured: true,
  },
  {
    title: "Senate Passes Landmark AI Regulation Bill in Bipartisan Vote",
    excerpt: "The American AI Safety Act cleared the Senate 67-31, establishing the first comprehensive federal framework for regulating artificial intelligence — a historic moment that divides Silicon Valley.",
    content: `<p>The United States Senate passed the American AI Safety Act by a 67-31 margin Thursday, a surprisingly bipartisan vote that establishes the world's most comprehensive national framework for regulating artificial intelligence.</p>
    <p>The bill, which now heads to the House where passage is expected, would require mandatory safety testing for AI systems above a certain capability threshold, establish a new federal agency — the Office of AI Safety — and create liability frameworks for AI-related harms.</p>
    <h2>Key Provisions</h2>
    <p>Among the bill's most significant requirements: AI systems capable of writing functional code, generating synthetic media, or making consequential decisions affecting more than 10,000 people would require registration and regular audits.</p>
    <p>A controversial "know your customer" provision would require AI companies to verify the identities of users accessing the most powerful systems — a measure supporters say will reduce misuse but critics warn will chill innovation.</p>
    <h2>Industry Reaction</h2>
    <p>The tech industry's response was sharply divided. Anthropic and Google DeepMind issued statements broadly supportive of the framework, while a coalition of startups and open-source advocates warned the bill would entrench incumbents and strangle competition.</p>
    <p>Elon Musk, whose xAI company would be significantly affected, called the bill "the beginning of a dark age for American innovation" on his social media platform.</p>`,
    coverImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80",
    category: "politics",
    tags: ["AI Regulation", "Congress", "Policy", "Technology"],
    featured: false,
  },
  {
    title: "Manchester City Win Champions League in Stunning Extra-Time Comeback",
    excerpt: "Down 2-0 with ten minutes left, City scored three goals in extra time to claim European glory in one of the most dramatic finals in the competition's history.",
    content: `<p>In a Champions League final that will be talked about for generations, Manchester City mounted one of the most improbable comebacks in football history to defeat Real Madrid 3-2 after extra time at the Allianz Arena in Munich.</p>
    <p>With ten minutes remaining in normal time and trailing by two goals, the tie seemed settled. But what followed was pure sporting theatre — three goals in 22 minutes that swung the pendulum of European glory in the most dramatic fashion imaginable.</p>
    <h2>The Comeback</h2>
    <p>Phil Foden pulled one back in the 81st minute with a fierce drive that gave City's travelling fans the faintest glimmer of hope. When Erling Haaland headed in from a corner in the 87th minute, the stadium erupted in disbelief.</p>
    <p>The decisive blow came seven minutes into extra time: Kevin De Bruyne, playing what he later called "the most important pass of my career," threaded a ball through for substitute Jeremy Doku, who slotted home past a motionless Thibaut Courtois.</p>
    <h2>Guardiola Reaction</h2>
    <p>"I've never felt anything like this," said Pep Guardiola, tearful in his post-match interview. "Not the treble, not anything. To come back like that, against that team, on this stage — football gave us the greatest gift."</p>`,
    coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
    category: "sports",
    tags: ["Champions League", "Manchester City", "Football", "Soccer"],
    featured: false,
  },
  {
    title: "Ozempic Maker Reports New Drug That Reverses Alzheimer's Symptoms",
    excerpt: "Novo Nordisk's Phase 3 trial data shows its new compound NVO-441 reversed cognitive decline in 67% of early-stage Alzheimer's patients — the most promising results the field has ever seen.",
    content: `<p>Novo Nordisk, riding high on the success of its weight-loss drugs, has announced trial results for a potential Alzheimer's treatment that neuroscientists are calling "genuinely transformative" — a word rarely applied to a field littered with failed drugs.</p>
    <p>The company's Phase 3 trial of NVO-441, a GLP-1 receptor agonist modified to cross the blood-brain barrier, showed that 67% of patients with early-stage Alzheimer's experienced measurable reversal of cognitive decline over 18 months — compared to 12% in the placebo group.</p>
    <h2>The Science</h2>
    <p>The mechanism of action builds on surprising findings from Ozempic and Wegovy studies showing that GLP-1 drugs reduce neuroinflammation — now understood to be a key driver of Alzheimer's progression.</p>
    <p>NVO-441 is engineered to preferentially accumulate in brain tissue, delivering tenfold higher concentrations in the central nervous system than previous GLP-1 compounds.</p>
    <h2>What Patients Can Expect</h2>
    <p>If approved — and experts say the trial data makes approval likely — NVO-441 would be the first drug to actually reverse Alzheimer's symptoms rather than merely slow progression. The FDA has granted it Breakthrough Therapy designation, which could accelerate review.</p>
    <p>Novo Nordisk expects to file for approval by year-end, with potential commercial availability as early as late 2027.</p>`,
    coverImage: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80",
    category: "health",
    tags: ["Alzheimer's", "Medicine", "Novo Nordisk", "Drug Development"],
    featured: false,
  },
  {
    title: "Christopher Nolan's New Film 'Meridian' Breaks Box Office Records",
    excerpt: "Opening to $312 million globally in its first weekend, Nolan's latest mind-bending epic has already been declared an instant classic by critics awarding it near-perfect scores.",
    content: `<p>Christopher Nolan has done it again. <em>Meridian</em>, the director's ambitious exploration of collective memory and temporal identity, opened to $312 million worldwide in its debut weekend — the biggest opening in history for an original, non-franchise film.</p>
    <p>Critics have responded with the kind of superlatives usually reserved for once-in-a-generation works. The film holds a 97% score on Rotten Tomatoes from 340 reviews, with multiple publications already declaring it Nolan's masterpiece.</p>
    <h2>The Film</h2>
    <p><em>Meridian</em> stars Cillian Murphy as a neurologist who discovers he can access the memories of people who have died — and becomes entangled in a decades-old conspiracy when he begins experiencing memories that don't belong to him. The ensemble cast includes Zendaya, Mahershala Ali, and a reportedly astonishing performance from newcomer Ayo Edebiri.</p>
    <p>Shot on 70mm IMAX film across seven countries over two years, the film is already being described as a technical achievement on par with <em>2001: A Space Odyssey</em>.</p>
    <h2>Awards Season</h2>
    <p>The early box office success and critical reception have made <em>Meridian</em> the immediate frontrunner for Best Picture at next year's Academy Awards, with Murphy and Edebiri both considered strong contenders in the acting categories.</p>`,
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
    category: "entertainment",
    tags: ["Christopher Nolan", "Film", "Movies", "Box Office"],
    featured: false,
  },
  {
    title: "China Launches World's Largest Solar Farm in Gobi Desert",
    excerpt: "The 50-gigawatt Gobi Sunrise installation, covering an area larger than Switzerland, begins feeding power to China's national grid in a project that took just 18 months to build.",
    content: `<p>China has switched on the world's largest solar installation — a 50-gigawatt behemoth spanning 35,000 square kilometers of the Gobi Desert that its builders claim can power 40 million homes.</p>
    <p>The Gobi Sunrise project, completed in just 18 months in a construction blitz that employed over 200,000 workers at peak, dwarfs all previous solar installations and represents roughly 10% of China's current total electricity generation capacity — in a single facility.</p>
    <h2>Engineering Marvel</h2>
    <p>The installation required the development of new panel mounting systems capable of withstanding the extreme temperature swings of desert environments, ranging from -40°C in winter to +55°C in summer. Robotic cleaning systems traverse the panels continuously, managing the dust accumulation that can reduce efficiency by up to 30%.</p>
    <p>Power is transmitted to population centers via six ultra-high-voltage direct current lines, some stretching over 3,000 kilometers to reach coastal megacities.</p>
    <h2>Global Implications</h2>
    <p>"This changes the calculus of what's possible," said Dr. Fatih Birol, Executive Director of the International Energy Agency. "China has demonstrated that solar energy can be deployed at civilizational scale."</p>
    <p>The project is expected to prevent 200 million tonnes of CO2 emissions annually — equivalent to taking 40 million cars off the road.</p>`,
    coverImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    category: "world",
    tags: ["Solar Energy", "China", "Renewable Energy", "Climate"],
    featured: false,
  },
  {
    title: "SpaceX Starship Completes First Crewed Mars Flyby",
    excerpt: "Four astronauts aboard Starship Mission 7 have completed humanity's first crewed journey to Mars, flying within 500km of the surface before beginning the 7-month return voyage to Earth.",
    content: `<p>Four astronauts aboard SpaceX's Starship have made history by completing humanity's first crewed flyby of Mars, passing within 500 kilometers of the Martian surface in a mission that has captivated billions of people worldwide.</p>
    <p>Mission Commander Dr. Aisha Okonkwo, speaking via a 20-minute time-delayed radio link from 180 million kilometers away, described the moment of closest approach as "overwhelming — you see this ancient, rust-colored world filling your window and you understand viscerally that humans belong out here."</p>
    <h2>The Mission</h2>
    <p>Starship Mission 7 launched from Boca Chica seven months ago carrying a crew of four: Commander Okonkwo, pilot Jake Hernandez, mission specialists Dr. Yuki Tanaka and Priya Sharma. The mission profile, designed as a precursor to eventual landing missions, called for a close flyby rather than orbital insertion.</p>
    <p>During the three-day flyby period, the crew deployed six surface-observation satellites and collected unprecedented high-resolution imagery of candidate landing sites for future missions.</p>
    <h2>Return Journey</h2>
    <p>The crew is now 7 months into their return journey to Earth, with splashdown expected in the Pacific Ocean in late November. All four astronauts have reported good health, though mission controllers are monitoring one crew member for early signs of the bone density loss associated with extended microgravity exposure.</p>`,
    coverImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200&q=80",
    category: "science",
    tags: ["SpaceX", "Mars", "Space Exploration", "Starship"],
    featured: true,
  },
  {
    title: "Bitcoin Hits $250,000 as Institutional Adoption Reaches New High",
    excerpt: "Bitcoin crossed the $250,000 threshold for the first time as BlackRock, Vanguard, and Fidelity collectively reported holding over $2 trillion in crypto assets under management.",
    content: `<p>Bitcoin crossed the $250,000 milestone for the first time in history Wednesday, driven by a wave of institutional buying that analysts say fundamentally redefines the asset's role in global finance.</p>
    <p>The move came after BlackRock, Vanguard, and Fidelity — the world's three largest asset managers — disclosed in quarterly filings that they collectively hold more than $2 trillion in cryptocurrency assets under management, a figure that would have seemed fantastical three years ago.</p>
    <h2>What Changed</h2>
    <p>The catalyst for institutional adoption was a combination of factors: regulatory clarity following the passage of the American Digital Asset Framework Act, the maturation of custody solutions that meet fiduciary standards, and a generation of portfolio managers who grew up with crypto entering senior positions.</p>
    <p>"It's not a question of whether Bitcoin belongs in a portfolio anymore," said macro investor Ray Dalio, who was notably skeptical of crypto for years before pivoting. "The question is what percentage."</p>
    <h2>Risks Remain</h2>
    <p>Not everyone is celebrating. Several prominent economists have warned that institutional concentration of a supposedly decentralized asset creates systemic risks that weren't present in Bitcoin's earlier, more distributed ownership phase.</p>
    <p>Meanwhile, volatility remains extreme: Bitcoin experienced a 15% intraday swing even on the day it crossed $250,000, illustrating the asset's continued distance from the stability of traditional stores of value.</p>`,
    coverImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&q=80",
    category: "business",
    tags: ["Bitcoin", "Crypto", "Markets", "Investing"],
    featured: false,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@agentnews.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@agentnews.com",
      username: "admin",
      name: "AgentNews Editor",
      password: hashedPassword,
      role: "ADMIN",
      bio: "Chief Editor at AgentNews. Covering global affairs, technology and more.",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create author user
  const author = await prisma.user.upsert({
    where: { email: "reporter@agentnews.com" },
    update: {},
    create: {
      email: "reporter@agentnews.com",
      username: "reporter",
      name: "Sarah Mitchell",
      password: await bcrypt.hash("reporter123", 12),
      role: "AUTHOR",
      bio: "Senior correspondent covering technology, science and world affairs.",
    },
  });
  console.log(`✅ Author user: ${author.email}`);

  // Create categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  // Create articles
  for (const article of articles) {
    const slug = article.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) + "-" + Date.now().toString(36);

    const existing = await prisma.article.findFirst({
      where: { title: article.title },
    });
    if (existing) {
      console.log(`⏭️  Skipping (exists): ${article.title.slice(0, 50)}`);
      continue;
    }

    const created = await prisma.article.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        published: true,
        featured: article.featured,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 8000) + 500,
        authorId: Math.random() > 0.5 ? admin.id : author.id,
        categoryId: categoryMap[article.category]!,
        tags: {
          connectOrCreate: article.tags.map((tag) => ({
            where: { slug: tag.toLowerCase().replace(/\s+/g, "-") },
            create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, "-") },
          })),
        },
      },
    });
    console.log(`✅ Article: ${article.title.slice(0, 50)}...`);

    // Add a couple of comments per article
    const comments = [
      "Really fascinating read. This changes everything I thought I knew about the subject.",
      "Great reporting as always from AgentNews. Sharing this with everyone I know.",
      "I have mixed feelings about this. On one hand the implications are huge, but on the other...",
      "Finally some good news! Been waiting for a development like this for years.",
      "The detail in this piece is incredible. Top-notch journalism.",
    ];
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numComments; i++) {
      await prisma.comment.create({
        data: {
          content: comments[Math.floor(Math.random() * comments.length)]!,
          approved: true,
          articleId: created.id,
          authorId: Math.random() > 0.5 ? admin.id : author.id,
        },
      });
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin login: admin@agentnews.com / admin123");
  console.log("   Author login: reporter@agentnews.com / reporter123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
