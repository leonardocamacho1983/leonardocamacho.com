import type { PostCardDTO } from "@/lib/types";

const postTimestamp = (post: PostCardDTO): number => {
  const value = Date.parse(post.publishedAt);
  return Number.isNaN(value) ? 0 : value;
};

const dedupePosts = (posts: PostCardDTO[]): PostCardDTO[] => {
  const seen = new Set<string>();
  return posts.filter((post) => {
    const key = post.id || post.translationKey || post.slug;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getLaunchPosts = (posts: PostCardDTO[]): PostCardDTO[] => {
  const sorted = [...posts].sort((left, right) => postTimestamp(right) - postTimestamp(left));
  const flagship = sorted.filter((post) => post.templateVariant === "flagship");
  const curated = sorted.filter((post) => post.featuredOnHome || post.featuredInArchive);

  if (flagship.length > 0) {
    const launchStart = Math.min(...flagship.map((post) => postTimestamp(post)));
    const launchWindowPosts = sorted.filter(
      (post) => postTimestamp(post) >= launchStart,
    );
    const launchWindowCurated = launchWindowPosts.filter(
      (post) => post.featuredOnHome || post.featuredInArchive,
    );
    const launchWindowRemainder = launchWindowPosts.filter(
      (post) => post.templateVariant !== "flagship" && postTimestamp(post) >= launchStart,
    );

    return dedupePosts([
      ...flagship,
      ...(launchWindowCurated.length > 0 ? launchWindowCurated : launchWindowRemainder),
    ]);
  }

  if (curated.length > 0) {
    return dedupePosts(curated);
  }

  return sorted.slice(0, 1);
};
