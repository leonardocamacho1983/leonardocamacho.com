import type { PostCardDTO } from "@/lib/types";

const postTimestamp = (post: PostCardDTO): number => {
  const value = Date.parse(post.publishedAt);
  return Number.isNaN(value) ? 0 : value;
};

export const getLaunchPosts = (posts: PostCardDTO[]): PostCardDTO[] => {
  const flagship = posts.filter((post) => post.templateVariant === "flagship");
  const curated = posts.filter((post) => post.featuredOnHome || post.featuredInArchive);
  const source = flagship.length ? flagship : curated.length ? curated : posts.slice(0, 1);

  return [...source].sort((left, right) => postTimestamp(right) - postTimestamp(left));
};
