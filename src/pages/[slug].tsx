import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import { api } from "~/utils/api";

//Belo are for SSG
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data?.length === 0) return <div> No post from user. </div>;

  return (
    <div className="relative grow">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
      ;
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div> 404 </div>;

  return (
    <>
      <Head>
        <title>{isLoading ? "Profile Page" : data.username}</title>
      </Head>

      <PageLayout>
        <div className="relative h-36 border-b border-slate-400 bg-slate-600 p-4">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile image`}
            width={128}
            height={128}
            className="absolute bottom-0 left-4 -mb-16 rounded-full border-4 border-black bg-black"
          />
        </div>

        <div className="h-[64px]"></div>

        <div className="p-4 text-2xl font-bold">@{data.username}</div>

        <div className="border-b border-slate-400"></div>

        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      prisma,
      userId: null,
    },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
