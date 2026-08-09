<?php

namespace App\DTO;

class PostStatsDTO
{
    public function __construct(
        public int $total,
        public int $draft,
        public int $published,
        public int $pending,
        public int $archived,
    ) {}
}
