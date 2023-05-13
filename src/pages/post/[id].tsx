import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import { api } from "~/utils/api";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.posts.getPostById.useQuery({
    id,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div> 404 </div>;

  return (
    <>
      <Head>
        <title>
          {isLoading
            ? "Loading..."
            : `${data.post.content} by @${data.author.username}`}
        </title>
      </Head>

      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = (context) => {
  const id = context.params?.id;

  if (!id || typeof id !== "string") throw new Error("No slug!");

  return {
    props: {
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SinglePostPage;
