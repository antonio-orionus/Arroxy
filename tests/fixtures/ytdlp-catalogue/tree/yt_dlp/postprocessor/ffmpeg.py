from ..utils._utils import PostProcessingError


class FFmpegPostProcessor:
    def run(self, stderr):
        raise PostProcessingError(stderr.strip().splitlines()[-1])
