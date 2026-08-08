/** @jsx jsx */
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { Link as GatsbyLink } from "gatsby"
import { Box, Container, Flex, Heading, Link, Text, jsx } from "theme-ui"

const themes = [
  {
    title: "Belief memory in agents",
    description: "Learning, retrieving, and revising beliefs as agents interact with changing environments.",
  },
  {
    title: "Faithful use of context",
    description: "Understanding when language models use evidence and improving grounded generation and reasoning.",
  },
  {
    title: "Interpretability",
    description: "Explaining how models and agents use internal mechanisms, memory, and retrieved information.",
  },
]

const publications = [
  {
    year: "2026",
    venue: "Preprint",
    title: "Xetrieval: Mechanistically Explaining Dense Retrieval",
    authors: "Zhixin Cai, Jun Bai, Yang Liu, Jiaqi Li, et al.",
    links: [
      ["Paper", "https://arxiv.org/abs/2605.29507"],
      ["Code", "https://github.com/Hihiczx/Xetrieval"],
      ["Website", "https://hihiczx.github.io/Xetrieval"],
    ],
  },
  {
    year: "2026",
    venue: "Preprint",
    title: "OneMillion-Bench: How Far are Language Agents from Human Experts?",
    authors: "Qianyu Yang, Yang Liu, Jiaqi Li, Jun Bai, et al.",
    links: [
      ["Paper", "https://arxiv.org/abs/2603.07980"],
      ["Code", "https://github.com/humanlaya/OneMillion-Bench"],
      ["Data", "https://huggingface.co/datasets/humanlaya-data-lab/OneMillion-Bench"],
    ],
  },
  {
    year: "2025",
    venue: "EMNLP",
    title: "Understanding and Leveraging the Expert Specialization of Context Faithfulness in Mixture-of-Experts LLMs",
    authors: "Jun Bai, Minghao Tong, Yang Liu, Zixia Jia, and Zilong Zheng",
    links: [
      ["Paper", "https://aclanthology.org/2025.emnlp-main.1114/"],
      ["Code", "https://github.com/bigai-nlco/RouterLens"],
    ],
  },
  {
    year: "2025",
    venue: "EMNLP",
    title: "Reinforced Query Reasoners for Reasoning-intensive Retrieval Tasks",
    authors: "Xubo Qin, Jun Bai, Jiaqi Li, Zixia Jia, and Zilong Zheng",
    links: [
      ["Paper", "https://aclanthology.org/2025.emnlp-main.1078/"],
      ["Code", "https://github.com/bigai-nlco/TongSearch-QR"],
    ],
  },
] as const

const ResearchPage = (_props: PageProps) => (
  <Box sx={{ minHeight: "100vh", bg: "background", color: "text" }}>
    <Container as="header" sx={{ py: [4, 5], px: 0, mx: [3, "auto"], width: "auto", maxWidth: "1100px" }}>
      <Flex
        sx={{
          alignItems: ["flex-start", "center"],
          justifyContent: "space-between",
          flexDirection: ["column", "row"],
          gap: 3,
        }}
      >
        <GatsbyLink
          to="/"
          sx={{ color: "heading", fontWeight: "bold", fontSize: 2, textDecoration: "none" }}
        >
          Jun Bai
        </GatsbyLink>
        <Flex
          as="nav"
          aria-label="Primary navigation"
          sx={{ width: ["100%", "auto"], gap: [3, 4], flexWrap: "wrap" }}
        >
          <GatsbyLink to="/" sx={{ color: "text", textDecoration: "none" }}>
            Photography
          </GatsbyLink>
          <Link href="https://scholar.google.com/citations?user=D4WEfiEAAAAJ">Scholar</Link>
          <Link href="mailto:baijun@bigai.ai">Email</Link>
        </Flex>
      </Flex>
    </Container>

    <Container as="main" sx={{ px: 0, mx: [3, "auto"], width: "auto", maxWidth: "1100px", pb: [6, 7] }}>
      <Box sx={{ maxWidth: "760px", pt: [4, 5], pb: [5, 6] }}>
        <Text as="p" sx={{ color: "textMuted", fontWeight: "bold", mb: 2 }}>
          RESEARCH
        </Text>
        <Heading as="h1" sx={{ fontSize: [3, 5], lineHeight: 1.15, letterSpacing: 0, mb: 4 }}>
          Trustworthy AI, memory, and reasoning.
        </Heading>
        <Text as="p" sx={{ fontSize: [1, 3], lineHeight: 1.6, color: "textMuted", letterSpacing: 0 }}>
          I work on language models and agents that can use evidence faithfully, maintain beliefs over time, and make
          their decisions easier to understand.
        </Text>
      </Box>

      <Box as="section" aria-labelledby="themes-heading" sx={{ mb: [6, 7] }}>
        <Heading id="themes-heading" as="h2" sx={{ fontSize: 3, mb: 4 }}>
          Current themes
        </Heading>
        <Box sx={{ display: "grid", gridTemplateColumns: ["1fr", "repeat(3, 1fr)"], gap: 4 }}>
          {themes.map((theme) => (
            <Box key={theme.title} sx={{ borderTop: "2px solid", borderColor: "text", pt: 3 }}>
              <Heading as="h3" sx={{ fontSize: 2, mt: 0, mb: 2 }}>
                {theme.title}
              </Heading>
              <Text as="p" sx={{ color: "textMuted", lineHeight: 1.6, mb: 0 }}>
                {theme.description}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box as="section" aria-labelledby="publications-heading">
        <Flex sx={{ justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 3, mb: 4 }}>
          <Heading id="publications-heading" as="h2" sx={{ fontSize: 3, my: 0 }}>
            Selected work
          </Heading>
          <Link href="https://scholar.google.com/citations?user=D4WEfiEAAAAJ">All publications</Link>
        </Flex>
        <Box sx={{ borderTop: "1px solid", borderColor: "muted" }}>
          {publications.map((publication) => (
            <Box
              as="article"
              key={publication.title}
              sx={{ display: "grid", gridTemplateColumns: ["1fr", "110px 1fr"], gap: [2, 4], py: 4, borderBottom: "1px solid", borderColor: "muted" }}
            >
              <Text sx={{ color: "textMuted", fontWeight: "bold" }}>
                {publication.year} · {publication.venue}
              </Text>
              <Box>
                <Heading as="h3" sx={{ fontSize: [2, 3], lineHeight: 1.3, mt: 0, mb: 2 }}>
                  {publication.title}
                </Heading>
                <Text as="p" sx={{ color: "textMuted", mb: 3 }}>
                  {publication.authors}
                </Text>
                <Flex sx={{ gap: 3, flexWrap: "wrap" }}>
                  {publication.links.map(([label, href]) => (
                    <Link key={label} href={href}>
                      {label}
                    </Link>
                  ))}
                </Flex>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>

    <Container
      as="footer"
      sx={{ px: 0, mx: [3, "auto"], width: "auto", maxWidth: "1100px", py: 5, borderTop: "1px solid", borderColor: "muted" }}
    >
      <Text sx={{ color: "textMuted" }}>Jun Bai · Beijing</Text>
    </Container>
  </Box>
)

export default ResearchPage

export const Head: HeadFC = () => (
  <>
    <html lang="en" />
    <title>Research | Jun Bai</title>
    <meta
      name="description"
      content="Research by Jun Bai on trustworthy AI, agent memory, context faithfulness, and interpretability."
    />
  </>
)
