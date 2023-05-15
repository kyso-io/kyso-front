import type { NormalizedResponseDTO, PaginatedResponseDto, ReportDTO, UserDTO } from '@kyso-io/kyso-model';

export const checkReportAuthors = (result: NormalizedResponseDTO<PaginatedResponseDto<ReportDTO>>) => {
  // Sort by global_pin and user_pin
  result.data.results.sort((a: ReportDTO, b: ReportDTO) => {
    if ((a.pin || a.user_pin) && !(b.pin || b.user_pin)) {
      return -1;
    }
    if ((b.pin || b.user_pin) && !(a.pin || a.user_pin)) {
      return 1;
    }
    return 0;
  });
  const dataWithAuthors: ReportDTO[] = [];
  for (const x of result.data.results) {
    const allAuthorsId: string[] = [...x.author_ids];
    const uniqueAllAuthorsId: string[] = Array.from(new Set(allAuthorsId));
    const allAuthorsData: UserDTO[] = [];
    for (const authorId of uniqueAllAuthorsId) {
      /* eslint-disable no-await-in-loop */
      if (result.relations?.user[authorId]) {
        allAuthorsData.push(result.relations.user[authorId]);
      }
    }
    x.authors = allAuthorsData;
    dataWithAuthors.push(x);
  }
  result.data.results = dataWithAuthors;
};
