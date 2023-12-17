import Link from "next/link";

export default function About() {
  return (
    <div className="px-5 sm:px-20 pt-10 pb-20 max-w-3xl mx-auto">
      <h1 className="py-4 text-2xl font-semibold">
        About Byobot.ai
      </h1>
      <p>
        Welcome to Byobot.ai, the place to share and discover ready-to-go APIs designed for extending LLMs.

        As the popularity of Large Language Models (LLMs) like ChatGPT continues to soar, Byobot.ai emerges as a pivotal platform for users and developers to extend chatbot capabilities. Our platform is akin to Product Hunt but exclusively tailored for the blossoming market of LLM integrations.
      </p>
      <h3 className="pt-5 pb-3 text-xl font-medium">
        What Distinguishes a GPT/Bot?
      </h3>
      <p>
        The defining feature of a GPT/bot is the ability to perform "actions," which we prefer the term "APIs" for their technical correctness.
        <br />
        <br />

        An API integration enables your chatbot to interact with external services, vastly expanding its capabilities. An excellent example of this is ChatGPT's ability to browse with Bing, an API integration that equips ChatGPT with web browsing functionalities.
      </p>
      <h2 className="pt-5 pb-3 text-xl font-medium">
        Byobot.ai: The GitHub for Next-Generation Developers
      </h2>
      <p>
        Byobot.ai is a community where developers can share and access deployed APIs that are ready for integration, making it possible to enhance your chat applications effortlessly.
        <br />
        <br />

        The integration of multiple APIs into ChatGPT is a breeze, allowing you to augment your application with a diverse range of features. The era of programming new applications using only natural language is finally upon us.
        <br />
        <br />

        For a comprehensive guide on how to integrate APIs using Byobot.ai, <Link href={"#"}>click here</Link>.
      </p>
    </div>
  )
}
