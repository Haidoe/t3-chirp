import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

import { LoadingPage } from "~/components/loading";

import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "yestocan",
  });

  if (isLoading) return <LoadingPage />;

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
      </PageLayout>
    </>
  );
};

export default ProfilePage;
